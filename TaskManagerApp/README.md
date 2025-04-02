# Task Manager Mobile App

A React Native mobile app for managing tasks built with Expo. This app is part of the Task Management System, which includes a web frontend and a Python serverless backend.

## Features

- User authentication (login/register)
- Task management (create, read, update, delete)
- Task filtering by status
- Task statistics visualization

## Prerequisites

- Docker and Docker Compose (for containerized setup)
- Node.js (>= 16) (for local development)
- npm or yarn (for local development)
- Expo Go app on your mobile device (for testing)

## Running with Docker (Recommended)

The easiest way to run the entire application stack (including backend, frontend, and mobile) is using Docker Compose:

1. **Start all services**:
   ```bash
   docker-compose up
   ```

2. **Access the mobile app**:
   - The Express server will start on port 19000
   - The Expo development server will be started automatically
   - You can access the Expo DevTools in your browser at `http://localhost:19002`

3. **Run on a device**:
   - Install the Expo Go app on your mobile device
   - Make sure your device is on the same network as your computer
   - Scan the QR code displayed in the Expo DevTools
   - Or use an emulator with `expo start --android` or `expo start --ios`

## Local Development (Alternative)

If you prefer to run the app directly on your machine:

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start the Express server**:
   ```bash
   npm start
   # or
   yarn start
   ```

3. **Or start Expo directly**:
   ```bash
   npm run expo
   # or
   yarn expo
   ```

4. **Run on a device or emulator**:
   - Scan the QR code with the Expo Go app on your device
   - Press 'a' in the terminal to open on an Android emulator
   - Press 'i' in the terminal to open on an iOS simulator (macOS only)

## Environment Configuration

The app uses environment variables for configuration. You can modify these in the `.env` file:

- `API_URL`: The URL of the backend API server
  - When using Docker: `http://backend:8000`
  - For local development: Use your computer's IP address or localhost

## Project Structure

- `src/components/`: Reusable UI components
- `src/screens/`: Screen components for each page
- `src/services/`: API services for data fetching
- `src/utils/`: Utility functions and configuration
- `assets/`: Images and other static assets
- `server.js`: Express server to manage the Expo process in Docker

## Backend Connection

This app connects to a Python serverless backend. The Docker Compose setup ensures that the backend is running and properly connected to the mobile app.

## Troubleshooting

If you encounter issues with the Expo development server in Docker:

1. Make sure all ports (19000, 19001, 19002, 8081) are exposed and not being used by other applications
2. Check the Docker logs for any error messages
3. Try running the app locally instead of in Docker
4. If the Express server is running but Expo isn't starting, try restarting the container

## Building for Production

To create a standalone app:

```bash
expo build:android  # For Android
expo build:ios      # For iOS (requires an Apple Developer account)