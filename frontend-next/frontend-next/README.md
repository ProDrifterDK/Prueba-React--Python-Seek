# Task Management System - Next.js Frontend

This is the Next.js frontend for the Task Management System. It provides a modern, responsive user interface for managing tasks.

## Features

- User authentication (login/register)
- Task management (create, update, delete)
- Task filtering by status
- Task statistics visualization with charts
- Responsive design using Material UI

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Material UI
- Chart.js
- Axios for API communication
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
```

### Running in Production

```bash
npm start
```

## Docker

This application can be run in a Docker container. A Dockerfile is provided in the root directory.

To build and run with Docker:

```bash
docker build -t task-management-frontend .
docker run -p 3000:3000 task-management-frontend
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: URL of the backend API (default: http://localhost:8000)

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: Reusable UI components
- `/src/context`: React context for state management
- `/src/services`: API services
