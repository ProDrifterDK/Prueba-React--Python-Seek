# Task Management System - Backend

This is the backend application for the Task Management System, built with Python, FastAPI, and MongoDB, designed to be deployed as AWS Lambda functions.

## Features

- User authentication with JWT tokens
- CRUD operations for tasks
- Task statistics
- MongoDB integration
- Serverless deployment with AWS Lambda and API Gateway

## Prerequisites

- Python 3.9+
- MongoDB Atlas account
- AWS account (for deployment)
- Serverless Framework (for deployment)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/task-management-system.git
   cd task-management-system/backend
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

5. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task_management?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   ```

## Running the Application Locally

```
uvicorn src.handler:app --reload
```

This will start the development server at [http://localhost:8000](http://localhost:8000).

## API Documentation

When the application is running, you can access the API documentation at:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure

```
backend/
├── src/
│   ├── auth/                # Authentication module
│   │   ├── router.py        # Authentication routes
│   │   └── service.py       # Authentication service
│   ├── models/              # Data models
│   │   ├── task.py          # Task models
│   │   └── user.py          # User models
│   ├── tasks/               # Tasks module
│   │   ├── router.py        # Task routes
│   │   └── service.py       # Task service
│   ├── utils/               # Utility functions
│   │   ├── auth.py          # Authentication utilities
│   │   └── database.py      # Database utilities
│   ├── tests/               # Test files
│   └── handler.py           # Main application handler
├── serverless.yml           # Serverless Framework configuration
├── requirements.txt         # Project dependencies
├── Dockerfile               # Docker configuration
└── README.md                # Project documentation
```

## Testing

```
pytest
```

This will run the test suite using pytest.

## Deployment

### Serverless Framework

The backend is designed to be deployed as AWS Lambda functions using the Serverless Framework:

1. Install the Serverless Framework:
   ```
   npm install -g serverless
   ```

2. Configure AWS credentials:
   ```
   serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
   ```

3. Deploy the application:
   ```
   serverless deploy
   ```

### Docker

The backend can also be deployed using Docker:

```
docker build -t task-management-backend .
docker run -p 8000:8000 -e MONGODB_URI=your_mongodb_uri -e JWT_SECRET=your_jwt_secret task-management-backend
```

## API Endpoints

### Authentication

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login and get JWT token
- `GET /auth/me`: Get current user information

### Tasks

- `GET /tasks`: Get all tasks
- `POST /tasks`: Create a new task
- `GET /tasks/{id}`: Get a task by ID
- `PUT /tasks/{id}`: Update a task
- `DELETE /tasks/{id}`: Delete a task
- `GET /tasks/stats`: Get task statistics

## Database Schema

### Users Collection

```json
{
  "_id": "ObjectId",
  "id": "string (UUID)",
  "username": "string",
  "email": "string",
  "password_hash": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Tasks Collection

```json
{
  "_id": "ObjectId",
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "title": "string",
  "description": "string",
  "status": "string (todo, in_progress, completed)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.