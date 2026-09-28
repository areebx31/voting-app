#Voting App

This is a backend voting application that I built while learning Node.js and backend development.

The project uses Node.js, Express.js, MongoDB and Mongoose. I also implemented JWT authentication and password hashing using bcryptjs.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- Postman

## Features

- User signup
- User login and authentication
- Password hashing
- JWT token authentication
- Protected routes
- Candidate management
- Voting functionality
- Vote counting
- MongoDB database

## Project Structure

```text
voting app/
├── models/
│   ├── User.js
│   └── Candidate.js
├── routes/
│   ├── userRoutes.js
│   └── candidateRoutes.js
├── server.js
├── db.js
├── jwt.js
├── package.json
└── .env
