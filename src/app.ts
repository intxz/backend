import express, { Application } from 'express';
import { AuthRoutes } from './routes/authRoutes'; // Import the authentication routes
import { UserRoutes } from './routes/userRoutes'; // Import the user routes
import { ChatsRoutes } from './routes/chatsRoutes'; // Import the chat routes
import { MessageRoutes } from './routes/messageRoutes'; // Import the message routes
import { query } from './config/database'; // Import the database query function

const app: Application = express(); // Initialize the Express application
const PORT = 3000; // Define the port number the server will run on

// Middleware to handle JSON requests
app.use(express.json()); // Enables the app to parse JSON requests

// Initialize and configure routes
const authRoutes = new AuthRoutes(); // Create an instance of AuthRoutes
const userRoutes = new UserRoutes(); // Create an instance of UserRoutes
const chatRoutes = new ChatsRoutes(); // Create an instance of ChatsRoutes
const messageRoutes = new MessageRoutes(); // Create an instance of MessageRoutes

// Define and initialize all routes
chatRoutes.route(app); // Setup chat-related routes
userRoutes.route(app); // Setup user-related routes
messageRoutes.route(app); // Setup message-related routes
authRoutes.route(app); // Setup authentication routes

// Test route for the main endpoint
app.get('/', (req, res) => {
  res.send('Express server is running!'); // Basic route for testing if the server is running
});

// Test the connection to the database
query('SELECT NOW()', [])
  .then(result => {
    console.log('Database connection established successfully:', result.rows[0]); // Log successful connection
  })
  .catch(error => {
    console.error('Error connecting to the database:', error); // Log connection error
  });

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log when the server starts successfully
});
