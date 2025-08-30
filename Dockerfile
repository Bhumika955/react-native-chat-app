# Use official Node.js LTS image as base
FROM node:18-alpine AS build

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --production

# Copy backend source code
COPY backend/src ./backend/src
COPY backend/.env.example ./backend/.env.example

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "src/index.js"]

# Documentation for environment variables:
# - PORT: port number to run backend (default 5000)
# - MONGO_URI: MongoDB connection string
# - JWT_SECRET: secret key for JWT
# - CORS_ORIGIN: allowed origin for CORS
# - SOCKET_IO_PATH: path for socket.io endpoint (default /socket.io)
