# Ichgram — Fullstack Social App

Ichgram is a fullstack social platform inspired by Instagram, built as a final project during a Node.js course.

The goal of the project was not only to implement core social features, but also to practice real-world fullstack architecture, state management, and production-like deployment.

---

## Live Demo

https://ichgram-wheat.vercel.app/login

---

## What This Project Demonstrates

* Building a fullstack application from scratch (client + server)
* Designing a modular backend architecture (feature-based structure)
* Managing global state across multiple pages (Redux)
* Implementing authentication and protected routes (JWT)
* Working with real-time communication (Socket.io)
* Handling async flows and API integration
* Deploying a fullstack app (Vercel + Render + MongoDB Atlas)

---

## Features

* Authentication (register/login with JWT)
* User profile (update info and avatar)
* Posts CRUD (create, edit, delete, view)
* Likes and comments system
* User search and Explore feed
* Real-time chat (Socket.io)
* Notifications system

---

## Tech Stack

Frontend:

* React (Vite)
* TypeScript
* Redux
* Tailwind CSS

Backend:

* Node.js
* Express
* MongoDB (Mongoose)
* JWT
* Zod

Realtime:

* Socket.io

Deployment:

* Vercel (frontend)
* Render (backend)
* MongoDB Atlas (database)

---

## Architecture

The project follows a feature-based modular structure on the backend:

/modules
/auth
/users
/posts
/comments
/likes
/chat
/notifications

Each module is isolated and contains:

* routes
* controller
* service
* validation
* model

This approach improves scalability and maintainability compared to a layer-based structure.

---

## Key Challenges

1. Global state consistency
   Updating user data (e.g. username) across different pages required proper state synchronization using Redux.

2. Authentication flow
   Handling token storage, protected routes, and keeping UI in sync with auth state.

3. Real-time communication
   Implementing Socket.io and managing connections, events, and message flow.

4. Media handling
   Using Base64 for image storage as an MVP solution and understanding its limitations.

---

## Future Improvements

* Replace Base64 with cloud storage (S3 or Cloudinary)
* Add pagination and caching
* Improve performance of feed loading
* Add automated tests
* Improve UX and error handling

---

## Getting Started

git clone git@github.com:AnnaLindemann/ichgram.git
cd ichgram

Create `.env` in `/server`:

PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

Install dependencies:

cd server
npm install

cd ../client
npm install

Run project:

cd server
npm run dev

cd client
npm run dev

---

## Author

Anna Lindemann
Fullstack Developer

---

## Note

This project was built as part of a structured course with defined requirements, including authentication, posts, interactions, and real-time features .
