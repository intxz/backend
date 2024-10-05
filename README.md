# Management API

This is a personal project designed to practice building an API for user management, chat creation, and message handling. The project is currently not intended for production use, though it may later be utilized for practice with deployment tools like **Heroku**, **AWS**, **Google Cloud**, or similar platforms.

## Features

- **User Management**: Register, authenticate (login), update, and delete user accounts.
- **Chat Management**: Create, update, delete, and retrieve chat data linked to users.
- **Message Handling**: Create, update, delete, and retrieve messages within chats.
- **Role-based Access Control**: Restrict certain operations to users with specific roles (e.g., admin privileges).
  
## Project Structure

- **src/app.ts**: Initializes the Express server and sets up the routes.
- **src/controllers**: Contains the logic for handling users, chats, and messages.
- **src/middlewares**: Includes authentication and role-checking middleware.
- **src/routes**: Defines the API routes for user, chat, and message management.

## Technologies Used

- **Node.js**: Server runtime environment.
- **Express**: Web framework for building the API.
- **TypeScript**: Typed superset of JavaScript for improved development experience.
- **PostgreSQL**: Database used to store users, chats, and messages.
- **JWT (JSON Web Tokens)**: Used for authentication and authorization.
- **Bcrypt**: Library for hashing user passwords.

## API Endpoints

### Authentication

- `POST /login`: Authenticates a user and returns a JWT token.

### User Management

- `POST /register`: Register a new user.
- `GET /users`: Retrieve all users (Admin only).
- `GET /users/:id`: Retrieve a specific user by ID.
- `PUT /users/profile/:id`: Update the authenticated user's profile.
- `DELETE /users/profile/:id`: Delete the authenticated user's account.

### Chat Management

- `POST /chats`: Create a new chat.
- `GET /chats`: Retrieve all chats for the authenticated user.
- `PUT /chats/:id`: Update a chat by its ID.
- `DELETE /chats/:id`: Delete a chat by its ID.

### Message Management

- `POST /messages`: Create a new message in a chat.
- `GET /messages`: Retrieve all messages in a chat.
- `PUT /messages/:id`: Update a message by its ID.
- `DELETE /messages/:id`: Delete a message by its ID.

## Running the Project Locally

1. Clone the repository.
   ```bash
   git clone https://github.com/intxz/backend.git
2. Install dependencies.
    ```bash
    npm install
3. Set up environment variables, including the PostgreSQL connection and JWT secret.
4. Run the server.
   ```bash
    npm start
5. Access the API via http://localhost:3000

### Future Plans
The next step in the project is to create a MongoDB database to handle data for a specialized AI. This AI will be focused on gym training, specifically aimed at correcting users if they are performing exercises incorrectly using computer vision. The plan is to further enhance this by building a Flutter-based frontend to interact with this AI system.
