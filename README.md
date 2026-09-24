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

## Setup

1. Install dependencies:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

2. Copy `.env.example` to `.env` and add your values.

3. Start the app:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3000`.

## Environment

Use the root `.env` file for backend config. Add your ImageKit and Brevo keys in `.env`.

```bash
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
EMAIL_USER=
BREVO_API_KEY=
```

## Production

```bash
npm run build
npm start
```

The app serves the built frontend from `backend/public`.
