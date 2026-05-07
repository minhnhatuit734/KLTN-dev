FROM python:3.10-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch first (separate layer for better caching)
RUN pip install --no-cache-dir torch==2.5.1+cpu torchvision==0.20.1+cpu torchaudio==2.5.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install python dependencies (separate layer so changes to src don't re-download)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code last (most likely to change)
COPY . .

ENV PYTHONPATH=/app
