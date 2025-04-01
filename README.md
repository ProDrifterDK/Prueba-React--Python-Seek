# Task Management System

A full-stack application for managing tasks with React/Next.js frontend and Python serverless backend.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete tasks
- Filter tasks by status (to do, in progress, completed)
- Visualize task statistics with charts
- Responsive design with Material UI
- Serverless backend with AWS Lambda and API Gateway
- MongoDB database for data storage
- Docker containerization

## Architecture

The application follows a client-server architecture:

- **Frontend**: 
  - React.js with Material UI (original implementation)
  - Next.js with Material UI (improved implementation)
- **Backend**: Python with FastAPI, deployed as AWS Lambda functions
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens

## Project Structure

```
task-management-system/
├── frontend/                  # React web application
├── frontend-next/             # Next.js web application
├── backend/                   # Python serverless backend
├── mobile/                    # React Native application (optional)
├── docs/                      # API documentation
├── docker-compose.yml         # Docker Compose configuration
└── README.md                  # Project documentation
```

## Prerequisites

- Node.js (v14+ for React, v18+ for Next.js)
- Python (v3.9+)
- Docker and Docker Compose
- MongoDB Atlas account
- AWS account (for deployment)

## Setup and Installation

### Environment Variables

1. Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Local Development

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the backend locally:
   ```
   uvicorn src.handler:app --reload
   ```

#### Frontend (React)

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the frontend locally:
   ```
   npm start
   ```

#### Frontend (Next.js)

1. Navigate to the Next.js frontend directory:
   ```
   cd frontend-next/frontend-next
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the frontend locally:
   ```
   npm run dev
   ```

### Docker Deployment

To run the entire application using Docker:

```
docker-compose up -d
```

This will start both the frontend and backend services.

## AWS Deployment

### Backend Deployment

1. Install the Serverless Framework:
   ```
   npm install -g serverless
   ```

2. Deploy the backend:
   ```
   cd backend
   serverless deploy
   ```

### Frontend Deployment (React)

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Deploy to AWS S3 and CloudFront (using AWS CLI):
   ```
   aws s3 sync build/ s3://your-bucket-name
   ```

### Frontend Deployment (Next.js)

1. Build the Next.js frontend:
   ```
   cd frontend-next/frontend-next
   npm run build
   ```

2. Deploy to AWS using AWS Amplify or other suitable service for Next.js applications.

## API Documentation

Once the backend is running, you can access the API documentation at:

- Local: http://localhost:8000/docs
- Deployed: https://your-api-gateway-url/dev/docs

## Testing

### Backend Tests

```
cd backend
pytest
```

### Frontend Tests (React)

```
cd frontend
npm test
```

### Frontend Tests (Next.js)

```
cd frontend-next/frontend-next
npm test
```

## License

This project is licensed under the MIT License.