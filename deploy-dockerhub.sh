#!/bin/bash

set -e

if [ $# -ne 1 ]; then
  echo "Usage: $0 <tag>"
  exit 1
fi

TAG=$1
USERNAME="elementarlabs"

# Массивы: локальные имена сервисов (в build-compose) и имена для Docker Hub
LOCAL_SERVICES=("api" "app")
HUB_SERVICES=("circlo-api" "circlo-app")

echo "======================================"
# Check if buildx builder exists and create if not
docker buildx inspect multiarch > /dev/null 2>&1 || docker buildx create --name multiarch
docker buildx use multiarch

echo "Step 1: Building local images using docker-compose.yml for multiple platforms..."
echo "======================================"

# Перебор сервисов и их сборка в фоновом режиме
for i in "${!LOCAL_SERVICES[@]}"; do
  LOCAL_NAME="${LOCAL_SERVICES[$i]}"
  HUB_NAME="${HUB_SERVICES[$i]}"

  echo "Starting build and push for $HUB_NAME..."
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --cache-from type=registry,ref=$USERNAME/$HUB_NAME:cache \
    --cache-to type=registry,ref=$USERNAME/$HUB_NAME:cache,mode=max \
    -f .docker/$LOCAL_NAME/Dockerfile \
    -t $USERNAME/$HUB_NAME:$TAG \
    --push . &
done

# Ожидание завершения всех фоновых процессов
wait

echo "======================================"
echo "All images built and pushed to Docker Hub successfully!"
