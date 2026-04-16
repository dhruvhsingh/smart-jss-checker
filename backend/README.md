---
title: Smart JSS Checker API
emoji: 📸
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
---

# Smart JSS Readiness Checker — Backend API

FastAPI backend for the Smart JSS Readiness Checker field-rollout app.

## How it works

This backend uses **CLIP (ViT-B/32)** from OpenAI, running **fully locally** inside this
Hugging Face Space. There are **no external AI API calls**, **no rate limits**, and
**no per-request costs**. Hugging Face Spaces free CPU tier provides 16 GB RAM and
2 vCPUs, which is more than enough to run CLIP for this workload.

## Endpoints

- `GET /` — service info
- `GET /health` — health check
- `POST /api/analyze` — main analysis endpoint (multipart form: `prm_id` + `photo`)

## Environment variables

Set these in **Settings → Variables and secrets** of your Space:

| Key | Required | Description |
|---|---|---|
| `APPS_SCRIPT_URL` | yes | Google Apps Script webhook URL for Drive + Sheets |
| `ALLOWED_ORIGINS` | yes | Frontend URL(s), comma-separated (e.g. `https://my-app.vercel.app`) |
| `MAX_FILE_SIZE_MB` | no  | default `15` |
| `REVIEW_THRESHOLD` | no  | confidence threshold below which review is required, default `0.70` |

## Cost

Free forever on Hugging Face Spaces CPU Basic tier.
