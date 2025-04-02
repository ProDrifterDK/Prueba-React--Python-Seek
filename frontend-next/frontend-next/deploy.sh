#!/bin/bash

# AWS Deployment Script for Frontend (Next.js)

echo "====================================================="
echo "Deploying Task Management System Frontend to AWS Amplify"
echo "====================================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "AWS Amplify CLI is not installed. Installing..."
    npm install -g @aws-amplify/cli
fi

# Get the backend API URL
echo "Please enter the backend API URL (from backend deployment):"
read API_URL

# Update the environment variables
echo "Updating environment variables..."
cat > .env.production << EOL
NEXT_PUBLIC_API_URL=$API_URL
EOL

# Build the project
echo "Building the project..."
npm ci
npm run build

# Deploy to AWS Amplify
echo "Deploying to AWS Amplify..."
echo "NOTE: This script will guide you through the Amplify setup process."
echo "You will need to:"
echo "1. Sign in to your AWS account"
echo "2. Create a new Amplify app or select an existing one"
echo "3. Follow the prompts to complete the deployment"

# Initialize Amplify if not already initialized
if [ ! -d "amplify" ]; then
    echo "Initializing Amplify..."
    amplify init
fi

# Add hosting if not already added
if [ ! -d "amplify/backend/hosting" ]; then
    echo "Adding hosting..."
    amplify add hosting
fi

# Publish the app
echo "Publishing the app..."
amplify publish

echo "====================================================="
echo "Deployment completed!"
echo "Your app should now be accessible at the URL provided above."
echo "====================================================="