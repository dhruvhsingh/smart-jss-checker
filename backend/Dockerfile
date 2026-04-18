FROM python:3.11-slim

RUN useradd -m -u 1000 user
USER user

ENV PATH="/home/user/.local/bin:$PATH" \
    HF_HOME="/home/user/.cache/huggingface" \
    TRANSFORMERS_OFFLINE=0 \
    PYTHONUNBUFFERED=1

WORKDIR /home/user/app

# Install CPU-only PyTorch
RUN pip install --no-cache-dir --user \
    torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user . .

# Pre-download the LARGER CLIP model (ViT-L/14 — much more accurate than ViT-B/32)
# ~890 MB model, fits easily in 16GB RAM. Significant accuracy improvement.
RUN python -c "from transformers import CLIPModel, CLIPProcessor; \
    CLIPModel.from_pretrained('openai/clip-vit-large-patch14'); \
    CLIPProcessor.from_pretrained('openai/clip-vit-large-patch14'); \
    print('CLIP ViT-L/14 model cached.')"

EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
