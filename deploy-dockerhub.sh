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
# Check if builder exists and create if not
if ! docker buildx inspect default > /dev/null 2>&1; then
  docker buildx create --use
fi

echo "Step 1: Building local images..."
echo "======================================"

# Loop through services and build them
for i in "${!LOCAL_SERVICES[@]}"; do
  LOCAL_NAME="${LOCAL_SERVICES[$i]}"
  HUB_NAME="${HUB_SERVICES[$i]}"

  echo "Starting build and push for $HUB_NAME..."
  docker buildx build \
    --platform linux/amd64 \
    --cache-from type=gha \
    --cache-to type=gha,mode=max \
    -f .docker/$LOCAL_NAME/Dockerfile \
    -t $USERNAME/$HUB_NAME:$TAG \
    -t $USERNAME/$HUB_NAME:latest \
    --push .
done

# Success message
echo "======================================"
echo "All images built and pushed successfully!"
