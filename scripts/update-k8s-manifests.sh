#!/usr/bin/env bash
set -euo pipefail

TARGET_ENV="${1:-}"
IMAGE_TAG="${2:-}"

if [ -z "$TARGET_ENV" ] || [ -z "$IMAGE_TAG" ]; then
  echo "Usage: ./scripts/update-k8s-manifests.sh <dev|prod> <image_tag>"
  exit 1
fi

if [ "$TARGET_ENV" != "dev" ] && [ "$TARGET_ENV" != "prod" ]; then
  echo "Invalid TARGET_ENV: $TARGET_ENV"
  exit 1
fi

if [ -z "${GIT_USER:-}" ] || [ -z "${GIT_TOKEN:-}" ]; then
  echo "GIT_USER or GIT_TOKEN is missing"
  exit 1
fi

DOCKERHUB_REPO="${DOCKERHUB_REPO:-mnhat1}"
MANIFEST_REPO="${MANIFEST_REPO:-github.com/minhnhatuit734/k8s-manifests.git}"
MANIFEST_BRANCH="${MANIFEST_BRANCH:-main}"

rm -rf k8s-manifests

git clone -b "${MANIFEST_BRANCH}" "https://${GIT_USER}:${GIT_TOKEN}@${MANIFEST_REPO}" k8s-manifests

cd k8s-manifests

KUSTOMIZATION_FILE="overlays/${TARGET_ENV}/kustomization.yaml"

if [ ! -f "$KUSTOMIZATION_FILE" ]; then
  echo "Missing file: $KUSTOMIZATION_FILE"
  exit 1
fi

python3 - "$KUSTOMIZATION_FILE" "$IMAGE_TAG" <<'PY'
import sys
from pathlib import Path

file_path = Path(sys.argv[1])
image_tag = sys.argv[2]

services = [
    "api-gateway",
    "auth-service",
    "users-service",
    "tours-service",
    "bookings-service",
    "reviews-service",
    "blog-service",
    "chat-service",
    "frontend",
]

lines = file_path.read_text().splitlines()
output = []
current_service = None

for line in lines:
    stripped = line.strip()

    if stripped.startswith("- name: mnhat1/"):
        current_service = stripped.split("mnhat1/", 1)[1].strip()
        output.append(line)
        continue

    if stripped.startswith("newTag:") and current_service in services:
        indent = line[:len(line) - len(line.lstrip())]
        output.append(f'{indent}newTag: {image_tag}')
        current_service = None
        continue

    output.append(line)

file_path.write_text("\n".join(output) + "\n")
PY

echo "Updated image tags in ${KUSTOMIZATION_FILE}"
grep -A1 "name: ${DOCKERHUB_REPO}/" "$KUSTOMIZATION_FILE"

git config user.name "jenkins"
git config user.email "jenkins@local"

git add "$KUSTOMIZATION_FILE"

if git diff --cached --quiet; then
  echo "No manifest changes to commit."
else
  git commit -m "ci(${TARGET_ENV}): update image tag ${IMAGE_TAG}"
  git push origin "${MANIFEST_BRANCH}"
fi