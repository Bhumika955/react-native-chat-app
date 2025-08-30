Real-Time Chat App

A 1:1 real-time chat application built using React Native (frontend) and Node.js (Express + Socket.IO) backend, with MongoDB as the database.

This project implements real-time messaging, user authentication, and online/offline status tracking.

Table of Contents

Features

Tech Stack

Folder Structure

Setup & Installation

Environment Variables

API Endpoints

Socket.IO Events

Usage

Contributing

License

Features

Authentication:

Register, Login with JWT-based auth

User List:

Show all users

Tap to start a chat

Chat Screen:

Real-time messaging with Socket.IO

Messages persist in database

Typing indicator

Online/offline status

Message delivery/read receipts

Basic UI:

Authentication screens

Home screen with user list & last messages

Chat screen with scrollable messages, input box, typing indicators, and ticks

Tech Stack

Frontend: React Native

Backend: Node.js + Express

Real-time: Socket.IO

Database: MongoDB / PostgreSQL (MongoDB recommended)

Auth: JWT

Folder Structure
/mobile         # React Native frontend
/server         # Node.js backend

Setup & Installation
Backend

Navigate to /server:

cd server


Install dependencies:

npm install


Start the server:

npm run dev


Server runs at http://localhost:5000

Frontend

Navigate to /mobile:

cd mobile


Install dependencies:

npm install


Start the app:

npx react-native run-android   # for Android
npx react-native run-ios       # for iOS

Environment Variables

Create a .env file in /server with the following:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

API Endpoints

Auth

POST /auth/register → Register a new user

POST /auth/login → Login user

Users

GET /users → Get all users

Messages

GET /conversations/:id/messages → Get messages of a conversation

Socket.IO Events

Client → Server:

message:send → Send a new message

typing:start → Start typing

typing:stop → Stop typing

message:read → Mark message as read

Server → Client:

message:new → Receive new message

typing:start|stop → Typing indicator updates

Usage

Register a new user or login with existing credentials

View the user list

Tap on a user to start chat

Send messages in real-time

See typing indicators, online/offline status, and message delivery/read ticks

Contributing

Feel free to open issues, submit pull requests, or suggest improvements.
<video controls src="demo video.mp4" title="Title"></video>