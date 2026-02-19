# ICHgram

Fullstack project: React + Express + MongoDB.

# Project Architecture

## Repo layout
- /client — React (Vite) + ChatCN (shadcn/ui) UI
- /server — Node.js + Express REST API
- /docker-compose.yml — local dev: client + server + mongo

## Server architecture (feature modules)
server/src/modules/<feature> contains:
- routes
- controller
- service (business logic)
- model (mongoose schema)
- validation (zod/joi)

Core features:
- auth (JWT + bcrypt)
- users (profile + avatar)
- posts (CRUD + images)
- comments
- likes
- search
Optional:
- follows
- notifications
- chat (socket.io)

## Client architecture (features)
client/src/features/<feature> contains UI + hooks for that domain.
Shared:
- shared/api (http client)
- shared/ui (ChatCN components)
- shared/lib (utils)

