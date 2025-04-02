# Task Management System

A serverless backend application for managing tasks with Python, AWS Lambda, and MongoDB.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete tasks
- Filter tasks by status (to do, in progress, completed)
- Visualize task statistics
- Serverless backend with AWS Lambda and API Gateway
- MongoDB database for data storage
- Docker containerization for local development

## Architecture

The application follows a serverless architecture:

- **Backend**: Python with FastAPI, deployed as AWS Lambda functions
- **API Gateway**: Exposes Lambda functions as RESTful endpoints
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens

## Project Structure

```
task-management-system/
├── backend/                   # Python serverless backend
│   ├── src/                   # Source code
│   │   ├── auth/              # Authentication logic
│   │   ├── models/            # Data models
│   │   ├── tasks/             # Task management logic
│   │   ├── utils/             # Utility functions
│   │   └── handler.py         # Main handler for Lambda
│   ├── serverless.yml         # Serverless Framework configuration
│   └── requirements.txt       # Python dependencies
├── docs/                      # API documentation
├── docker-compose.yml         # Docker Compose configuration
├── BACKEND-DEPLOYMENT.md      # Detailed backend deployment guide
└── README.md                  # Project documentation
```

## Prerequisites

- Python (v3.9+)
- Docker and Docker Compose (for local development)
- MongoDB Atlas account
- AWS account (for deployment)

## Setup and Installation

### Environment Variables

1. Create a `.env` file in the backend directory with the following variables:

```
MONGODB_URI=mongodb+srv://cdlprodrifterdk:S9OuIeboMSTjgvGF@cluster0.rr1gmhh.mongodb.net/task-management?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=8f42a31e9b5d4c7a6e2d1f0b5c8a7e6d4b2c1a3f5e8d7c6b9a0f1e2d3c4b5a6
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

### Docker Deployment

To run the backend using Docker:

```
docker-compose up -d mongodb backend
```

This will start the MongoDB and backend services.

## AWS Deployment

The backend has been successfully deployed to AWS Lambda and API Gateway. The API is accessible at:

```
https://9c9bsd1p45.execute-api.us-east-2.amazonaws.com/etapa
```

### Verifying the Deployment

You can verify the backend deployment using the provided script:

```
backend-deployment-verification.bat
```

This script will test all endpoints of the API to ensure they are working correctly.

### Deployment Documentation

For detailed information about the backend deployment, including:
- Available endpoints
- Authentication
- Providing access to collaborators
- Monitoring and logs

See [BACKEND-DEPLOYMENT.md](BACKEND-DEPLOYMENT.md).

## API Documentation

The API provides the following endpoints:

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | /auth/register | Register a new user | No |
| POST | /auth/login | Login and get JWT token | No |
| GET | /tasks | Get all tasks | Yes |
| POST | /tasks | Create a new task | Yes |
| GET | /tasks/{id} | Get a specific task | Yes |
| PUT | /tasks/{id} | Update a task | Yes |
| DELETE | /tasks/{id} | Delete a task | Yes |
| GET | /tasks/stats | Get task statistics | Yes |

## Testing

### Backend Tests

```
cd backend
pytest
```

## License

This project is licensed under the MIT License.