#!/bin/bash

# Install dependencies with legacy peer deps flag
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "Building the application..."
npm run build

echo "Build completed successfully!"
