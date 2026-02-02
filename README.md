# Workout Tracker API

A RESTful API backend system for managing workouts, tracking fitness progress, and generating workout reports. Built with Node.js, Express, and MongoDB with secure JWT authentication using Access Token + Refresh Token system.

## Features

- **User Authentication**: JWT-based authentication with access tokens (15 min) and refresh tokens (7 days)
- **Token Rotation**: Automatic token refresh for seamless user experience
- **Exercise Database**: Pre-populated database with 30+ exercises across multiple categories
- **Workout Management**: Create, read, update, and delete workout plans
- **Workout Scheduling**: Schedule workouts for specific dates and times
- **Progress Tracking**: Track workout completion and generate detailed progress reports
- **Authorization**: Users can only access their own workout data
- **Secure Logout**: Invalidate refresh tokens for immediate security

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) with dual-token system
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## Database Schema

### User

- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `refreshToken`: String (for token validation)

### Exercise

- `name`: String (required, unique)
- `description`: String (required)
- `category`: Enum (cardio, strength, flexibility, balance, sports)
- `muscleGroup`: Enum (chest, back, legs, shoulders, arms, core, full-body, cardio)

### Workout

- `user`: Reference to User (required)
- `name`: String (required)
- `description`: String
- `exercises`: Array of WorkoutExercise objects
- `scheduledDate`: Date (required)
- `status`: Enum (pending, completed, skipped)
- `completedDate`: Date
- `comments`: String

### WorkoutExercise (embedded)

- `exercise`: Reference to Exercise (required)
- `sets`: Number (required, min: 1)
- `repetitions`: Number (required, min: 1)
- `weight`: Number (default: 0)
- `duration`: Number (default: 0)
- `notes`: String

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd workout-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/workout-tracker
JWT_SECRET=your_secure_secret_key_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

5. Make sure MongoDB is running on your system

6. Seed the database with exercises:

```bash
npm run seed
```

7. Start the server:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5001`

## API Endpoints

### Authentication

#### Sign Up

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully. Access token expires in 15 minutes."
}
```

**Important:** Save both tokens!

- `accessToken`: Use for all API calls (expires in 15 minutes)
- `refreshToken`: Use to get new access token when it expires

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful. Access token expires in 15 minutes."
}
```

#### Refresh Access Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "NEW_ACCESS_TOKEN",
    "refreshToken": "NEW_REFRESH_TOKEN"
  },
  "message": "Tokens refreshed successfully"
}
```

**Use this endpoint when:**

- You get a `401 TOKEN_EXPIRED` error
- Access token has expired (after 15 minutes)

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

This invalidates your refresh token. You'll need to login again.

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Exercises

#### Get All Exercises

```http
GET /api/exercises
Authorization: Bearer <accessToken>

# With filters
GET /api/exercises?category=strength&muscleGroup=chest
```

#### Get Exercise by ID

```http
GET /api/exercises/:id
Authorization: Bearer <accessToken>
```

### Workouts

#### Create Workout

```http
POST /api/workouts
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Upper Body Strength",
  "description": "Focus on chest and back",
  "scheduledDate": "2024-02-05T10:00:00Z",
  "exercises": [
    {
      "exercise": "507f1f77bcf86cd799439011",
      "sets": 3,
      "repetitions": 12,
      "weight": 50,
      "notes": "Focus on form"
    },
    {
      "exercise": "507f1f77bcf86cd799439012",
      "sets": 3,
      "repetitions": 10,
      "weight": 40
    }
  ]
}
```

#### Get All Workouts

```http
GET /api/workouts
Authorization: Bearer <accessToken>

# With filters
GET /api/workouts?status=pending
GET /api/workouts?startDate=2024-01-01&endDate=2024-12-31
GET /api/workouts?status=completed&startDate=2024-01-01
```

#### Get Workout by ID

```http
GET /api/workouts/:id
Authorization: Bearer <accessToken>
```

#### Update Workout

```http
PUT /api/workouts/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "completed",
  "comments": "Great workout! Felt strong today."
}
```

#### Delete Workout

```http
DELETE /api/workouts/:id
Authorization: Bearer <accessToken>
```

### Reports

#### Generate Progress Report

```http
GET /api/workouts/reports/progress
Authorization: Bearer <accessToken>

# With date range
GET /api/workouts/reports/progress?startDate=2024-01-01&endDate=2024-12-31
```

Response:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalWorkouts": 45,
      "totalExercises": 180,
      "averageExercisesPerWorkout": "4.00",
      "currentStreak": 7,
      "longestStreak": 14
    },
    "muscleGroupDistribution": {
      "chest": 30,
      "back": 28,
      "legs": 35,
      "arms": 25
    },
    "topExercises": [
      {
        "name": "Squats",
        "count": 25
      },
      {
        "name": "Bench Press",
        "count": 22
      }
    ],
    "recentWorkouts": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Leg Day",
        "completedDate": "2024-02-01T10:00:00Z",
        "exerciseCount": 5
      }
    ]
  }
}
```

## Token Management Guide

### Understanding the Two Tokens

**Access Token (15 minutes):**

- Short-lived for security
- Used for all API calls
- Sent in `Authorization: Bearer <accessToken>` header
- If stolen, attacker has limited time

**Refresh Token (7 days):**

- Long-lived for convenience
- Used only to get new access tokens
- Stored in database for validation
- Can be revoked immediately (logout)

### Typical Flow

```
1. User logs in
   ↓
2. Receives accessToken + refreshToken
   ↓
3. Uses accessToken for API calls (15 min)
   ↓
4. Access token expires
   ↓
5. Call /auth/refresh with refreshToken
   ↓
6. Receive new accessToken + refreshToken
   ↓
7. Continue using new accessToken
```

### Handling Token Expiration

When you get this error:

```json
{
  "success": false,
  "message": "Access token expired. Please refresh your token.",
  "code": "TOKEN_EXPIRED"
}
```

**Solution:**

```bash
curl -X POST http://localhost:5001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

**Client Implementation Example:**

```javascript
// Automatically handle token refresh
async function apiCall(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // If access token expired, refresh it
  if (response.status === 401) {
    const errorData = await response.json();

    if (errorData.code === "TOKEN_EXPIRED") {
      // Refresh tokens
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const { data } = await refreshResponse.json();
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;

        // Save new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Retry original request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        // Refresh token also expired, redirect to login
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  }

  return response;
}
```

## API Documentation

Full API documentation is available in OpenAPI 3.0 format in the `openapi.yaml` file. You can view it using:

- [Swagger Editor](https://editor.swagger.io/) - Paste the content of openapi.yaml
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Host the documentation locally
- [Redoc](https://github.com/Redocly/redoc) - Generate beautiful API documentation

## Usage Examples

### Complete Workflow Example

```bash
# 1. Sign up a new user
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securepass123"
  }'

# Response includes accessToken and refreshToken
# Save both tokens!

# 2. Get available exercises (using access token)
curl -X GET http://localhost:5001/api/exercises \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Create a workout
curl -X POST http://localhost:5001/api/workouts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Leg Day",
    "scheduledDate": "2024-02-05T09:00:00Z",
    "exercises": [
      {
        "exercise": "EXERCISE_ID_FROM_STEP_2",
        "sets": 4,
        "repetitions": 10,
        "weight": 100
      }
    ]
  }'

# 4. Get pending workouts
curl -X GET "http://localhost:5001/api/workouts?status=pending" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 5. Mark workout as completed
curl -X PUT http://localhost:5001/api/workouts/WORKOUT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "comments": "Excellent session!"
  }'

# 6. Generate progress report
curl -X GET http://localhost:5001/api/workouts/reports/progress \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 7. When access token expires (after 15 min), refresh it
curl -X POST http://localhost:5001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# 8. Logout (invalidates refresh token)
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

For validation errors:

```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Common Error Codes

| Status | Code                 | Description                              | Solution                       |
| ------ | -------------------- | ---------------------------------------- | ------------------------------ |
| 400    | -                    | Bad request / Validation error           | Check request body             |
| 401    | `TOKEN_EXPIRED`      | Access token has expired                 | Call `/auth/refresh`           |
| 401    | `TOKEN_INVALID`      | Token is invalid or malformed            | Login again                    |
| 401    | `INVALID_TOKEN_TYPE` | Used refresh token instead of access     | Use access token for API calls |
| 401    | `NO_TOKEN`           | No token provided in Authorization       | Add Authorization header       |
| 401    | `USER_NOT_FOUND`     | User associated with token doesn't exist | Login again                    |
| 403    | -                    | Forbidden - accessing other user's data  | Check resource ownership       |
| 404    | -                    | Resource not found                       | Verify ID is correct           |
| 500    | -                    | Server error                             | Contact support or check logs  |

## Security Features

- **Two-Token System**: Access tokens (15 min) + Refresh tokens (7 days)
- **Token Rotation**: New refresh token issued on each refresh for enhanced security
- **Passwords Hashed**: bcrypt with salt rounds before storage
- **Token Type Validation**: Access tokens can't be used as refresh tokens and vice versa
- **Database Token Storage**: Refresh tokens stored in DB for validation
- **Logout Invalidation**: Refresh token removed from DB on logout
- **Protected Routes**: JWT authentication required for all protected endpoints
- **User Isolation**: Users can only access their own workout data
- **Input Validation**: express-validator on all endpoints
- **MongoDB Injection Protection**: Via Mongoose sanitization
- **HTTPS Recommended**: Use HTTPS in production to prevent token interception

## Project Structure

```
workout-tracker/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic (signup, login, refresh, logout)
│   │   ├── exerciseController.js # Exercise management
│   │   └── workoutController.js # Workout management & reports
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & token validation
│   │   └── validate.js          # Request validation
│   ├── models/
│   │   ├── User.js              # User schema with refreshToken field
│   │   ├── Exercise.js          # Exercise schema
│   │   └── Workout.js           # Workout schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints (including /refresh & /logout)
│   │   ├── exerciseRoutes.js    # Exercise endpoints
│   │   └── workoutRoutes.js     # Workout endpoints
│   ├── seeders/
│   │   └── exerciseSeeder.js    # Database seeder (30+ exercises)
│   ├── utils/
│   │   └── jwt.js               # JWT utilities (access & refresh token generation)
│   └── server.js                # Express app setup
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
├── postman_collection.json      # Postman collection with refresh token support
├── openapi.yaml                 # OpenAPI 3.0 API documentation
└── README.md                    # This file
```

## Testing with Postman

1. Import `postman_collection.json` into Postman
2. The collection automatically saves both `accessToken` and `refreshToken`
3. All requests use the saved `accessToken`
4. When access token expires, use the "Refresh Token" request
5. New tokens are automatically saved

**Collection Features:**

- ✓ Auto-saves tokens after signup/login/refresh
- ✓ Uses `{{accessToken}}` variable in all protected routes
- ✓ Includes refresh token endpoint
- ✓ Clears tokens on logout

## Environment Variables

| Variable             | Description                    | Default                                 | Required |
| -------------------- | ------------------------------ | --------------------------------------- | -------- |
| `PORT`               | Server port                    | `5001`                                  | No       |
| `MONGODB_URI`        | MongoDB connection string      | `mongodb://localhost:27017/workout-...` | Yes      |
| `JWT_SECRET`         | Secret key for signing JWT     | -                                       | Yes      |
| `JWT_ACCESS_EXPIRE`  | Access token expiration time   | `15m`                                   | No       |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration time  | `7d`                                    | No       |
| `NODE_ENV`           | Environment (development/prod) | `development`                           | No       |

**Token Expiration Format:**

- `15m` = 15 minutes
- `1h` = 1 hour
- `7d` = 7 days
- `30d` = 30 days

## Deployment Considerations

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string (use `openssl rand -base64 64`)
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for all API calls
- [ ] Configure CORS properly for your domain
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Set up rate limiting (consider express-rate-limit)
- [ ] Configure logging (consider winston)
- [ ] Set up monitoring (consider PM2)
- [ ] Regular database backups

### Recommended Token Expiration for Production

```env
JWT_ACCESS_EXPIRE=15m    # Short-lived for security
JWT_REFRESH_EXPIRE=30d   # Longer for user convenience
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo journalctl -u mongod
```

### Token Issues

**"Access token expired"**

- This is normal after 15 minutes
- Use `/auth/refresh` endpoint with refresh token

**"Invalid refresh token"**

- Refresh token may have expired (7 days)
- User may have logged out
- Login again to get new tokens

**"Invalid token type"**

- You're using refresh token for API calls
- Use access token instead

### Port Already in Use

```bash
# Find process using port 5001
lsof -ti:5001

# Kill the process
lsof -ti:5001 | xargs kill
```

## Future Enhancements

- [ ] Add workout templates for quick creation
- [ ] Implement workout sharing between users
- [ ] Add photo uploads for progress tracking
- [ ] Create workout analytics dashboard
- [ ] Add REST endpoints for workout history graphs
- [ ] Implement social features (friends, challenges)
- [ ] Add notification system for scheduled workouts
- [ ] Implement email verification on signup
- [ ] Add password reset functionality
- [ ] Create mobile app support (iOS/Android)
- [ ] Add multi-language support
- [ ] Implement workout recommendation system

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For issues, questions, or contributions, please:

- Open an issue on GitHub
- Check existing issues for solutions
- Review the API documentation in `openapi.yaml`
- Test with the Postman collection

## License

ISC

---

## Quick Reference

### Essential Commands

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Seed database
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

### Essential Endpoints

```bash
# Authentication
POST   /api/auth/signup     # Register
POST   /api/auth/login      # Login
POST   /api/auth/refresh    # Refresh token
POST   /api/auth/logout     # Logout
GET    /api/auth/me         # Get current user

# Exercises
GET    /api/exercises       # List all
GET    /api/exercises/:id   # Get one

# Workouts
POST   /api/workouts        # Create
GET    /api/workouts        # List all
GET    /api/workouts/:id    # Get one
PUT    /api/workouts/:id    # Update
DELETE /api/workouts/:id    # Delete

# Reports
GET    /api/workouts/reports/progress  # Progress report
```

---

**Built with ❤️ using Node.js, Express, and MongoDB**
