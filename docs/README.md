# Task Management API Documentation

This directory contains the API documentation for the Task Management System.

## Overview

The Task Management API provides endpoints for:

- User authentication (register, login, get current user)
- Task management (create, read, update, delete tasks)
- Task statistics

## API Specification

The API is documented using the OpenAPI 3.0 specification in the `api-spec.yaml` file. This file can be used with various tools to generate documentation, client libraries, and more.

## Viewing the Documentation

There are several ways to view the API documentation:

### 1. Using Swagger UI

When the backend is running, you can access the Swagger UI at:

- Local: http://localhost:8000/docs
- Deployed: https://your-api-gateway-url/dev/docs

### 2. Using Swagger Editor

You can use the online Swagger Editor to view and edit the API specification:

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Import the `api-spec.yaml` file

### 3. Using Redoc

When the backend is running, you can access the Redoc documentation at:

- Local: http://localhost:8000/redoc
- Deployed: https://your-api-gateway-url/dev/redoc

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints, you need to:

1. Register a user account (`POST /auth/register`)
2. Login to get a token (`POST /auth/login`)
3. Include the token in the Authorization header of your requests:
   ```
   Authorization: Bearer your_token_here
   ```

## Error Handling

The API returns appropriate HTTP status codes and error messages in the response body:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required or invalid token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses have the following format:

```json
{
  "detail": "Error message"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. If you exceed the rate limit, you will receive a `429 Too Many Requests` response.

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins in development, but restricted to specific origins in production.