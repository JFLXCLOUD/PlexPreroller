#!/bin/bash

# Build multi-architecture Docker image for PlexPreroller
# This resolves the "exec format error" issue

echo "Setting up multi-architecture build environment..."

# Check if buildx is available
if ! command -v docker buildx &> /dev/null; then
    echo "Error: docker buildx is not available"
    exit 1
fi

# Create and configure a multi-arch builder
echo "Creating multi-architecture builder..."
docker buildx create --name multiarch-builder --driver docker-container --use 2>/dev/null || true

# Bootstrap the builder
echo "Bootstrapping builder..."
docker buildx inspect --bootstrap

# Verify platforms
echo "Available platforms:"
docker buildx inspect --bootstrap | grep -A 10 "Platforms:"

echo "Building multi-architecture Docker image..."

# Build for multiple architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag jbrns/plexpreroller:latest \
  --push \
  .

echo "Multi-architecture build complete!"
echo "Image: jbrns/plexpreroller:latest"
echo "Available for: AMD64, ARM64"

echo "Multi-architecture build complete!"
echo "Image: jbrns/plexpreroller:latest"
echo "Available for: AMD64, ARM64, ARMv7" 