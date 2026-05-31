# Workout Tracker

A full-stack workout tracking application for planning workouts, managing an exercise library, tracking workout status, and viewing progress analytics.

The project is split into a modern Angular frontend and a Node.js/Express backend API backed by MongoDB. Authentication is handled with JSON Web Tokens using access and refresh tokens.

<img width="3420" height="1722" alt="workout-tracker-login-page" src="https://github.com/user-attachments/assets/7e671ec7-bea8-470f-ad79-bf59a9b6f222" />
<br/>
<img width="3420" height="2466" alt="workout-tracker-app-inside" src="https://github.com/user-attachments/assets/cef995ec-66ce-49c3-aba1-1cecd27ed0f1" />

## Tech Stack

### Frontend

- Angular 19
- Tailwind CSS
- TypeScript
- Angular Forms
- Angular HttpClient
- Responsive glassmorphic dashboard UI

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- express-validator
- CORS
- dotenv

## Project Structure

```text
workout-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          MongoDB connection
│   │   ├── controllers/     Route handlers and business logic
│   │   ├── middleware/      Auth and validation middleware
│   │   ├── models/          Mongoose schemas
│   │   ├── routes/          API route definitions
│   │   ├── seeders/         Exercise database seeder
│   │   ├── utils/           JWT utilities
│   │   └── server.js        Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.html
│   │   │   ├── app.component.ts
│   │   │   └── app.config.ts
│   │   └── styles.css       Tailwind and global styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── package-lock.json
│
├── openapi.yaml             API documentation
├── postman_collection.json  Postman collection
├── package.json             Root convenience scripts
└── README.md
```

## Features

### Authentication

- User signup and login
- Password hashing with bcrypt
- JWT access token and refresh token flow
- Short-lived access tokens
- Refresh token rotation
- Logout invalidates the stored refresh token
- Protected API routes for exercises, workouts, and reports

### Exercise Library

- Pre-seeded exercise catalog with 30+ exercises
- Exercise categories such as strength, cardio, flexibility, balance, and sports
- Muscle group classification including chest, back, legs, shoulders, arms, core, full-body, and cardio
- Protected exercise listing and exercise detail endpoints

### Workout Management

- Create workouts with name, description, scheduled date, and multiple exercise entries
- Track sets, repetitions, weight, duration, and notes
- View all workouts for the authenticated user
- Filter workouts by status
- Update workout status through pending, completed, and skipped
- Automatically records completed date when a workout is marked completed
- Delete workouts

### Progress Analytics

- Summary report for completed workouts
- Total completed workouts
- Total exercises performed
- Average exercises per workout
- Current workout streak
- Longest workout streak
- Muscle group distribution
- Top exercises
- Recent completed workouts
- Optional date-range filtering

### Frontend Dashboard

- Angular single-page application
- Login and signup flow connected to the backend API
- Authenticated dashboard with user session persistence in local storage
- Workout creation form with dynamic exercise rows
- Workout schedule and status actions
- Exercise library panel
- Progress summary cards
- Subtle gradients, glassmorphic panels, and responsive Tailwind styling

## Prerequisites

Make sure the following are installed:

- Node.js 22 or later
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Environment Variables

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Example:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/workout-tracker
JWT_SECRET=replace_with_a_secure_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

Only the backend needs an environment file right now. The frontend currently calls the backend at:

```text
http://localhost:5001/api
```

If the backend URL changes in production, update the API base URL in the Angular app or move it into an Angular environment configuration.

## Installation

Install backend dependencies:

```bash
npm run backend:install
```

Install frontend dependencies:

```bash
npm run frontend:install
```

You can also install from inside each folder:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

## Database Seeding

Start MongoDB, then seed the exercise catalog:

```bash
npm run backend:seed
```

This clears and inserts the default exercise list used by the frontend workout form.

## Running the Application

Start the backend API:

```bash
npm run backend:dev
```

The backend runs on:

```text
http://localhost:5001
```

Start the frontend in a second terminal:

```bash
npm run frontend:start
```

The frontend runs on:

```text
http://localhost:4200
```

Open the frontend in your browser and sign up or log in.

## Root Scripts

```bash
npm run backend:install   # Install backend dependencies
npm run backend:dev       # Run backend with nodemon
npm run backend:start     # Run backend with node
npm run backend:seed      # Seed exercise catalog
npm run frontend:install  # Install frontend dependencies
npm run frontend:start    # Start Angular dev server
npm run frontend:build    # Build Angular app
```

## API Overview

### Auth

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Exercises

```http
GET /api/exercises
GET /api/exercises/:id
```

### Workouts

```http
POST   /api/workouts
GET    /api/workouts
GET    /api/workouts/:id
PUT    /api/workouts/:id
DELETE /api/workouts/:id
GET    /api/workouts/reports/progress
```

## Authentication Flow

1. A user signs up or logs in.
2. The backend returns an access token and refresh token.
3. The frontend stores the authenticated session in local storage.
4. Protected requests include the access token in the `Authorization` header.
5. On logout, the backend clears the stored refresh token and the frontend removes the local session.

Example protected request header:

```http
Authorization: Bearer <accessToken>
```

## Manual Testing Flow

1. Start MongoDB.
2. Create `backend/.env`.
3. Run `npm run backend:seed`.
4. Run `npm run backend:dev`.
5. Run `npm run frontend:start` in another terminal.
6. Open `http://localhost:4200`.
7. Sign up with a new account.
8. Confirm the exercise library loads.
9. Create a workout with one or more exercises.
10. Mark the workout completed.
11. Confirm the dashboard counts and progress report update.
12. Log out and log back in to confirm session behavior.

## Build

Build the Angular frontend:

```bash
npm run frontend:build
```

The production build output is generated inside:

```text
frontend/dist/frontend
```

## API Documentation

The repository includes:

- `openapi.yaml` for OpenAPI 3.0 documentation
- `postman_collection.json` for Postman testing

Use the Postman collection to test authentication, protected routes, workout creation, status updates, and progress reports.

## Notes Before Pushing to Git

- Commit `backend/.env.example`
- Do not commit `backend/.env`
- Commit both lockfiles:
  - `backend/package-lock.json`
  - `frontend/package-lock.json`
- Do not commit `node_modules`
- Do not commit Angular build output from `frontend/dist`

## Future Improvements

- Add Angular route guards and dedicated pages for auth/dashboard
- Add automatic access-token refresh on 401 responses
- Move frontend API base URL into Angular environment files for deployment
- Add unit and integration tests
- Add charts for muscle group distribution and workout streaks
- Add deployment configuration for frontend and backend hosting
