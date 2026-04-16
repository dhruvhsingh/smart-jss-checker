FROM python:3.11-slim

# HF Spaces requires a non-root user with UID 1000
RUN useradd -m -u 1000 user

USER user

ENV PATH="/home/user/.local/bin:$PATH" \
    HF_HOME="/home/user/.cache/huggingface" \
    TRANSFORMERS_OFFLINE=0 \
    PYTHONUNBUFFERED=1

WORKDIR /home/user/app

# Install CPU-only PyTorch FIRST (much smaller than default: ~200MB vs ~800MB)
RUN pip install --no-cache-dir --user \
    torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application code
COPY --chown=user . .

# Pre-download the CLIP model INTO the Docker image so first request is fast.
# This bakes the model weights (~150 MB) into the image; no runtime download.
RUN python -c "from transformers import CLIPModel, CLIPProcessor; \
    CLIPModel.from_pretrained('openai/clip-vit-base-patch32'); \
    CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32'); \
    print('CLIP model cached.')"

# HF Spaces default port
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
