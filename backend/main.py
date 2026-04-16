"""
Smart JSS Readiness Checker — Backend API
Runs CLIP (ViT-B/32) locally on CPU for zero-shot image analysis.
No external AI API calls, no rate limits, no per-request cost.
Deploys on Hugging Face Spaces free CPU tier.
"""

import os
import io
import base64
import logging
import traceback
from datetime import datetime, timezone, timedelta

import numpy as np
import torch
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from transformers import CLIPProcessor, CLIPModel
import httpx

# ============================================
# CONFIG
# ============================================
APPS_SCRIPT_URL    = os.getenv("APPS_SCRIPT_URL", "")
ALLOWED_ORIGINS    = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
MAX_FILE_SIZE_MB   = int(os.getenv("MAX_FILE_SIZE_MB", "15"))
MODEL_NAME         = os.getenv("CLIP_MODEL", "openai/clip-vit-base-patch32")
REVIEW_THRESHOLD   = float(os.getenv("REVIEW_THRESHOLD", "0.70"))
IST                = timezone(timedelta(hours=5, minutes=30))

# ============================================
# LOGGING
# ============================================
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("jss")

# ============================================
# MODEL LOAD (happens once at startup)
# ============================================
log.info(f"Loading CLIP model: {MODEL_NAME} ...")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL = CLIPModel.from_pretrained(MODEL_NAME).to(DEVICE)
PROCESSOR = CLIPProcessor.from_pretrained(MODEL_NAME)
MODEL.eval()
# Pre-compute logit scale for consistent probability calibration
LOGIT_SCALE = float(MODEL.logit_scale.exp().item())
log.info(f"CLIP loaded on {DEVICE}. logit_scale={LOGIT_SCALE:.2f}")

# ============================================
# FASTAPI APP
# ============================================
app = FastAPI(title="Smart JSS Readiness Checker API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != [] else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# PROMPT LIBRARY
# Carefully engineered positive/negative prompts for each check.
# ============================================

# --- CHECK 1: FEMALE ---
FEMALE_POSITIVE = [
    "a photograph of an adult woman",
    "a photograph of a female person",
    "a photograph of a lady standing",
    "a portrait of a woman",
]
FEMALE_NEGATIVE = [
    "a photograph of an adult man",
    "a photograph of a male person with a beard",
    "a portrait of a man",
    "a photograph without any person visible",
    "a photograph of only clothing items without any person",
    "a photograph of a group of many people",
]

# --- CHECK 2: JIO JACKET WORN ---
JACKET_POSITIVE = [
    "a person wearing a bright blue sleeveless vest with a round Jio logo on the chest",
    "a person wearing a blue Jio branded sleeveless jacket zipped on their torso",
    "a person standing and wearing a blue Jio vest over a shirt in a store",
    "a person with a blue sleeveless uniform vest on their body",
]
JACKET_NEGATIVE = [
    "a person not wearing any vest or jacket",
    "a person wearing only a shirt without any vest over it",
    "a blue jacket placed flat on a table",
    "a blue vest hanging on a clothes hanger",
    "a blue jacket held in the hands but not worn",
    "clothing items displayed on a retail rack",
    "a person wearing a non-blue shirt or jacket",
]

# --- CHECK 3: CORRECT LAMINATED JIO PROMOTIONAL PAPER HELD ---
PAPER_POSITIVE = [
    "a person holding a large blue laminated poster with Join Jio text and cricket offer",
    "a person holding a blue glossy promotional poster showing Jio Exclusive Offer with 5G graphics",
    "a blue Jio promotional poster with cricket and JioHotstar branding being held in the hands",
    "a person displaying a blue Jio poster with Unlimited 5G and Watch Cricket Free text",
]
PAPER_NEGATIVE = [
    "a person not holding any paper or poster",
    "a person holding a plain white sheet of paper with black printed text",
    "a person holding a document, script, or typed page",
    "a person with empty hands",
    "a person holding a book, notebook, or magazine",
    "a blue poster lying flat on a table without anyone holding it",
    "a person holding an A4 paper with internal text",
]

# ============================================
# CLIP HELPERS
# ============================================

@torch.no_grad()
def encode_image(image: Image.Image) -> torch.Tensor:
    """Return L2-normalized image embedding."""
    inputs = PROCESSOR(images=image, return_tensors="pt").to(DEVICE)
    feats = MODEL.get_image_features(**inputs)
    return feats / feats.norm(dim=-1, keepdim=True)


@torch.no_grad()
def encode_texts(prompts: list) -> torch.Tensor:
    """Return L2-normalized text embeddings for a list of prompts."""
    inputs = PROCESSOR(text=prompts, return_tensors="pt",
                       padding=True, truncation=True).to(DEVICE)
    feats = MODEL.get_text_features(**inputs)
    return feats / feats.norm(dim=-1, keepdim=True)


# Pre-compute text embeddings ONCE at startup (they never change)
log.info("Pre-computing prompt embeddings...")
FEMALE_POS_EMB = encode_texts(FEMALE_POSITIVE)
FEMALE_NEG_EMB = encode_texts(FEMALE_NEGATIVE)
JACKET_POS_EMB = encode_texts(JACKET_POSITIVE)
JACKET_NEG_EMB = encode_texts(JACKET_NEGATIVE)
PAPER_POS_EMB  = encode_texts(PAPER_POSITIVE)
PAPER_NEG_EMB  = encode_texts(PAPER_NEGATIVE)
log.info("Prompt embeddings cached.")


def binary_check(image_emb: torch.Tensor,
                 pos_emb: torch.Tensor,
                 neg_emb: torch.Tensor) -> dict:
    """
    Compare image embedding against positive/negative prompt sets.
    Returns probability that the positive class holds.
    """
    pos_sims = (image_emb @ pos_emb.T)[0].cpu().numpy()
    neg_sims = (image_emb @ neg_emb.T)[0].cpu().numpy()

    pos_mean = float(pos_sims.mean())
    neg_mean = float(neg_sims.mean())

    # CLIP-style logit scaling — converts cosine similarity into calibrated probability
    exp_pos = np.exp(pos_mean * LOGIT_SCALE)
    exp_neg = np.exp(neg_mean * LOGIT_SCALE)
    pos_prob = float(exp_pos / (exp_pos + exp_neg))

    return {
        "result": bool(pos_prob >= 0.5),
        "confidence": pos_prob,
        "pos_sim": pos_mean,
        "neg_sim": neg_mean,
    }


def analyze(image: Image.Image) -> dict:
    """Run all three checks on the uploaded image."""
    if image.mode != "RGB":
        image = image.convert("RGB")
    if max(image.size) > 1024:
        image.thumbnail((1024, 1024), Image.LANCZOS)

    img_emb = encode_image(image)

    female = binary_check(img_emb, FEMALE_POS_EMB, FEMALE_NEG_EMB)
    jacket = binary_check(img_emb, JACKET_POS_EMB, JACKET_NEG_EMB)
    paper  = binary_check(img_emb, PAPER_POS_EMB,  PAPER_NEG_EMB)

    # Review logic: confidence in the CALLED answer.
    # If called True, called_conf = pos_prob. If called False, called_conf = 1 - pos_prob.
    review_reasons = []
    for name, res in [("female", female), ("jacket", jacket), ("paper", paper)]:
        called_conf = res["confidence"] if res["result"] else 1.0 - res["confidence"]
        if called_conf < REVIEW_THRESHOLD:
            review_reasons.append(f"Low confidence on {name} ({called_conf:.2f})")

    # Extra safety: if all three positive probabilities are very low, likely no person
    if (female["confidence"] < 0.25 and
        jacket["confidence"] < 0.25 and
        paper["confidence"]  < 0.25):
        review_reasons.append("Possibly no person visible in photo")

    review_required = len(review_reasons) > 0
    review_reason = "; ".join(review_reasons) if review_reasons else ""

    return {
        "is_female": female["result"],
        "has_jio_jacket": jacket["result"],
        "has_laminated_jio_promotional_paper": paper["result"],
        "female_confidence": round(female["confidence"], 3),
        "jacket_confidence": round(jacket["confidence"], 3),
        "paper_confidence":  round(paper["confidence"],  3),
        "review_required": review_required,
        "review_reason": review_reason,
    }


# ============================================
# GOOGLE APPS SCRIPT UPLOADER
# ============================================
async def send_to_apps_script(prm_id, filename, image_b64, mime_type, result,
                              img_w, img_h, img_mode, timestamp_str):
    if not APPS_SCRIPT_URL:
        log.warning("APPS_SCRIPT_URL not set — skipping upload")
        return {"drive_file_url": "", "sheet_status": "Apps Script not configured"}

    payload = {
        "timestamp": timestamp_str,
        "prm_id": prm_id,
        "filename": filename,
        "is_female": str(result["is_female"]),
        "has_jio_jacket": str(result["has_jio_jacket"]),
        "has_laminated_jio_promotional_paper": str(result["has_laminated_jio_promotional_paper"]),
        "female_confidence": str(result["female_confidence"]),
        "jacket_confidence": str(result["jacket_confidence"]),
        "paper_confidence":  str(result["paper_confidence"]),
        "review_required": str(result["review_required"]),
        "review_reason": result["review_reason"],
        "image_width": str(img_w),
        "image_height": str(img_h),
        "image_mode": img_mode,
        "image_data": image_b64,
        "image_mime": mime_type,
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(APPS_SCRIPT_URL, json=payload, follow_redirects=True)
            resp.raise_for_status()
            data = resp.json()
            log.info(f"Apps Script OK — drive={data.get('drive_file_url','')[:60]}")
            return data
    except Exception as e:
        log.error(f"Apps Script error: {e}")
        return {"drive_file_url": "", "sheet_status": f"Upload failed: {str(e)[:120]}"}


# ============================================
# ROUTES
# ============================================
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Smart JSS Readiness Checker API",
        "version": "2.0.0",
        "model": MODEL_NAME,
        "device": DEVICE,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "apps_script_configured": bool(APPS_SCRIPT_URL),
        "allowed_origins": ALLOWED_ORIGINS,
        "device": DEVICE,
    }


@app.post("/api/analyze")
async def analyze_endpoint(
    prm_id: str = Form(...),
    photo: UploadFile = File(...),
):
    t0 = datetime.now(IST)
    ts = t0.strftime("%Y-%m-%d %H:%M:%S IST")

    # Validate PRM ID
    prm_id = prm_id.strip()
    if not prm_id:
        raise HTTPException(400, "PRM ID is required")
    if len(prm_id) > 50:
        raise HTTPException(400, "PRM ID must be under 50 characters")

    # Validate file type
    allowed_mimes = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    mime = (photo.content_type or "").lower()
    if mime not in allowed_mimes:
        raise HTTPException(400, f"Invalid file type: '{mime}'. Allowed: JPEG, PNG, WebP")

    image_bytes = await photo.read()
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(400, f"Image too large: {size_mb:.1f} MB. Max: {MAX_FILE_SIZE_MB} MB")

    # Validate image
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()  # cheap corruption check
        img = Image.open(io.BytesIO(image_bytes))  # re-open after verify
        img_w, img_h = img.size
        img_mode = img.mode
    except Exception:
        raise HTTPException(400, "Cannot open image — file may be corrupted")

    # Safe filename
    ext = mime.split("/")[-1].replace("jpeg", "jpg")
    safe_name = f"JSS_{prm_id}_{t0.strftime('%Y%m%d_%H%M%S')}.{ext}"

    log.info(f"PRM={prm_id} size={size_mb:.1f}MB dims={img_w}x{img_h}")

    # Run CLIP analysis
    try:
        result = analyze(img)
        log.info(f"  F={result['is_female']}({result['female_confidence']}) "
                 f"J={result['has_jio_jacket']}({result['jacket_confidence']}) "
                 f"P={result['has_laminated_jio_promotional_paper']}({result['paper_confidence']}) "
                 f"review={result['review_required']}")
    except Exception as e:
        log.error(f"CLIP analysis failed: {e}\n{traceback.format_exc()}")
        result = {
            "is_female": False,
            "has_jio_jacket": False,
            "has_laminated_jio_promotional_paper": False,
            "female_confidence": 0.0,
            "jacket_confidence": 0.0,
            "paper_confidence":  0.0,
            "review_required": True,
            "review_reason": f"Analysis Failed: {str(e)[:150]}",
        }

    # Send to Apps Script (Drive + Sheets)
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    upload = await send_to_apps_script(
        prm_id, safe_name, image_b64, mime, result,
        img_w, img_h, img_mode, ts
    )

    dt_ms = int((datetime.now(IST) - t0).total_seconds() * 1000)
    log.info(f"  completed in {dt_ms} ms")

    return JSONResponse({
        "success": True,
        "timestamp": ts,
        "prm_id": prm_id,
        "filename": safe_name,
        "is_female": result["is_female"],
        "has_jio_jacket": result["has_jio_jacket"],
        "has_laminated_jio_promotional_paper": result["has_laminated_jio_promotional_paper"],
        "female_confidence": result["female_confidence"],
        "jacket_confidence": result["jacket_confidence"],
        "paper_confidence":  result["paper_confidence"],
        "review_required":   result["review_required"],
        "review_reason":     result["review_reason"],
        "image_width":       img_w,
        "image_height":      img_h,
        "image_mode":        img_mode,
        "drive_file_url":    upload.get("drive_file_url", ""),
        "google_sheet_row_status": upload.get("sheet_status", "unknown"),
        "processing_ms":     dt_ms,
    })
