# Workout Tracker

A full-stack workout tracker with a Node.js/Express/MongoDB API and a modern Angular + Tailwind frontend.

## Project Structure

```text
backend/   Express API, MongoDB models, auth, seeders
frontend/  Angular standalone app styled with Tailwind CSS
```

## Features

- JWT signup, login, logout, and protected API calls
- Exercise library seeded from the backend
- Workout creation with multiple exercise lines
- Workout status updates for pending, completed, and skipped sessions
- Progress report cards and top-exercise insights
- Responsive Tailwind interface with a polished dashboard layout

## Setup

Install backend dependencies:

```bash
npm run backend:install
```

Install frontend dependencies:

```bash
npm run frontend:install
```

Create backend environment variables:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` if your MongoDB URL or JWT secret should be different.

## Run Locally

Start MongoDB, then seed the exercise library:

```bash
npm run backend:seed
```

Start the backend API:

```bash
npm run backend:dev
```

In a second terminal, start the Angular frontend:

```bash
npm run frontend:start
```

Open `http://localhost:4200`. The frontend calls the backend at `http://localhost:5001/api`.

## Test

Build the frontend:

```bash
npm run frontend:build
```

Check the backend starts:

```bash
npm run backend:start
```

Manual flow to verify integration:

1. Open `http://localhost:4200`.
2. Sign up with a new account.
3. Confirm exercises load in the library.
4. Create a workout with at least one exercise.
5. Mark the workout completed.
6. Confirm the progress report updates.
