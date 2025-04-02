# Use Node.js as the base image
FROM node:18-alpine

# Install dependencies required for Expo
RUN apk add --no-cache bash git openssh

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Copy the start script and make it executable
COPY start.sh ./
RUN chmod +x start.sh

# Copy the server.js file
COPY server.js ./

# Copy the app.json file
COPY app.json ./

# Create assets directory
RUN mkdir -p assets

# Copy the rest of the application
COPY . .

# Make sure the start script is executable (again, just to be safe)
RUN chmod +x start.sh

# Expose the ports for Expo and Express
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
EXPOSE 8081

# Start the application using the shell script
CMD ["./start.sh"]