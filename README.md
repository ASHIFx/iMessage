# iMessage

A full-stack real-time messaging application built with React, Express, MongoDB, and Socket.IO.

## Features

- Email/password registration with email OTP verification
- JWT authentication with refresh cookies
- Direct messaging with real-time Socket.IO updates
- Online user status and conversation history
- Image and video messages
- Profile editing with avatar support
- Light and dark themes with selectable accent presets
- Responsive interface for desktop and mobile screens

## Stack

- Frontend: React 19, Vite, Redux Toolkit, HeroUI, Tailwind CSS
- Backend: Node.js, Express 5, Mongoose, Socket.IO
- Services: MongoDB, Cloudinary, Brevo email API
- Deployment: Docker

## Requirements

- Node.js 22 or newer
- MongoDB
- npm
- Optional: Cloudinary and Brevo accounts for media uploads and email delivery

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. Copy `.env.example` to `.env` and add the required values.

3. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

   The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:3000`.

4. Seed sample users when needed:

   ```bash
   npm run seed --prefix backend
   ```

## Environment Variables

The backend reads its variables from the root `.env` file. The frontend uses Vite variables when a custom API or Socket.IO URL is needed. See `.env.example` for the complete list.

For local development, email delivery can be omitted. The verification code is returned in the API response and printed by the backend in development mode.

## Production Build

Build the frontend, copy the generated assets into the backend public directory, and build the backend bundle:

```bash
npm run build
npm start
```

The included Dockerfile performs the same build in a multi-stage image:

```bash
docker build -t imessage .
docker run --env-file .env -p 3001:3001 imessage
```

## Project Structure

```text
backend/     Express API, authentication, messages, Socket.IO, database models
frontend/    React and Vite client
Dockerfile   Multi-stage production image
```

## Notes

- Do not commit `.env` or production credentials.
- The default development database is `mongodb://127.0.0.1:27017/imessage`.
- The production server serves the built frontend from `backend/public`.
