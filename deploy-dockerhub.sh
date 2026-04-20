#!/bin/bash

set -e

if [ $# -ne 1 ]; then
  echo "Usage: $0 <tag>"
  exit 1
fi

TAG=$1
USERNAME="elementarlabs"

# Arrays: local service names (in build-compose) and names for Docker Hub
LOCAL_SERVICES=("api" "app")
HUB_SERVICES=("circlo-api" "circlo-app")

echo "======================================"
# Check if buildx builder exists and create if not
if ! docker buildx inspect multiarch > /dev/null 2>&1; then
  docker buildx create --name multiarch --driver docker-container --bootstrap --use
else
  docker buildx use multiarch
fi

echo "Step 1: Building local images using docker-compose.yml for multiple platforms..."
echo "======================================"

# Loop through services and build them in background
for i in "${!LOCAL_SERVICES[@]}"; do
  LOCAL_NAME="${LOCAL_SERVICES[$i]}"
  HUB_NAME="${HUB_SERVICES[$i]}"

  echo "Starting build and push for $HUB_NAME with tag $TAG and latest..."
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --cache-from type=registry,ref=$USERNAME/$HUB_NAME:cache \
    --cache-to type=registry,ref=$USERNAME/$HUB_NAME:cache,mode=max \
    -f .docker/$LOCAL_NAME/Dockerfile \
    -t $USERNAME/$HUB_NAME:$TAG \
    -t $USERNAME/$HUB_NAME:latest \
    --push .
done

# Optional: Add cleanup or success message
echo "======================================"
echo "Cleaning up local builders..."
docker buildx rm multiarch || true

echo "======================================"
echo "All images built and pushed to Docker Hub successfully!"
