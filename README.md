# Real-time 1:1 Chat Application

This project is a full-stack real-time 1:1 chat application built with React Native frontend and Node.js (Express + Socket.IO) backend. It uses MongoDB for data storage.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Socket.IO Events](#socketio-events)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Features

- User registration and login with JWT authentication
- User list display excluding current user
- 1:1 conversations with real-time messaging using Socket.IO
- Message read receipts (single/double tick)
- Typing indicators
- Messages stored and retrieved from MongoDB
- Secure REST APIs with JWT-based middleware
- Socket.IO connection authenticated with JWT
- React Native mobile app supporting Android and iOS

---

## Prerequisites

- Node.js (v16 or above recommended)
- npm or yarn
- MongoDB server running locally or remotely
- React Native development environment:
  - Android Studio or Xcode (for simulators)
  - React Native CLI or Expo (this project uses React Native CLI)
- Internet connection for installing dependencies

---

## Environment Setup

### Backend

Create a `.env` file in the `backend` folder based on `.env.example`:

