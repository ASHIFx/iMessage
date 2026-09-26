# iMessage

A real-time messaging app built with React, Express, MongoDB, and Socket.IO.

## Stack

- Frontend: React, Vite, HeroUI, Tailwind CSS
- Backend: Node.js, Express, Mongoose, Socket.IO
- Media: ImageKit
- Email: Brevo

## Features

- Email sign up and OTP verification
- JWT auth with refresh cookies
- Direct messaging with live updates
- Image and video messages
- Profile avatar support
- Light and dark themes

## Project Links

- GitHub: https://github.com/ASHIFx/iMessage
- Live demo: https://imessage-w2x7.onrender.com/

## Demo Account

On a fresh database, seed the demo accounts with:

```bash
npm --prefix backend run seed
```

Use this account to try the app:

- Email: `maya@example.com`
- Password: `password123`

The seed script also replaces messages involving the demo accounts, so use a test database.

## Setup

1. Install dependencies:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

2. Create a root `.env` file and add the required values from the Environment section below.

3. Start the app:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3000`.

## Environment

Use the root `.env` file for backend configuration:

```bash
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/imessage
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
EMAIL_USER=
BREVO_API_KEY=
```

## Production Deployment

This project is deployed as a monolith: one Node.js service serves the React frontend and the Express API from the same host. The root build creates the frontend bundle, copies it into `backend/public`, and builds the backend. Express serves the static frontend and API routes together.

### Deploy to Render

Create one Web Service for this repository and use the included root `Dockerfile`. Do not create a separate frontend service. The Dockerfile builds the frontend and backend and packages both into the same container; the deployed site and API share one URL.

Set these environment variables in the Render service:

```bash
NODE_ENV=production
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
FRONTEND_URL=https://your-render-service.onrender.com
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
EMAIL_USER=
BREVO_API_KEY=
```

Use the actual Render URL for `FRONTEND_URL`. Keep `VITE_API_URL` unset for this same-origin deployment; the frontend uses `/api` by default.

### Build and Run Locally

```bash
npm run build
npm start
```

The server listens on `PORT` (default `3000`) and serves the built frontend from `backend/public` alongside the API and Socket.IO connection.
