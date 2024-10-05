import { Application, Request, Response, NextFunction } from 'express';
import { MessagesController } from '../controllers/messagesController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

export class MessageRoutes {
  private auth_middleware: AuthMiddleware = new AuthMiddleware(); // Initialize an instance of AuthMiddleware
  private messages_controller: MessagesController = new MessagesController(); // Initialize an instance of MessagesController

  /**
   * Configures the message-related routes for the Express application.
   * All message routes are protected by the authentication middleware.
   * 
   * @param app - The Express application object.
   */
  public route(app: Application) {
    /**
     * Middleware applied to all message routes to verify the JWT token.
     * If the token is invalid, the request will be blocked.
     */
    app.use('/messages', (req: Request, res: Response, next: NextFunction) => {
      this.auth_middleware.verifyToken(req, res, next); // Verify token before accessing message routes
    });

    /**
     * Route for creating a new message.
     * The request body should contain the message content and associated chat ID.
     * A new message will be created and associated with the authenticated user.
     */
    app.post('/messages', (req: Request, res: Response) => {
      this.messages_controller.createMessage(req, res); // Call createMessage from MessagesController
    });

    /**
     * Route for retrieving messages from a specific chat.
     * Responds with a list of messages for the given chat ID, accessible only to authorized users.
     */
    app.get('/messages', (req: Request, res: Response) => {
      this.messages_controller.getMessages(req, res); // Call getMessages from MessagesController
    });

    /**
     * Route for updating a message's content by message ID.
     * The message ID is provided as a URL parameter, and the request body contains the updated content.
     * Only the message creator is authorized to update the message.
     */
    app.put('/messages/:id', (req: Request, res: Response) => {
      this.messages_controller.updateMessage(req, res); // Call updateMessage from MessagesController
    });

    /**
     * Route for deleting a message by message ID.
     * Only the message creator is authorized to delete the message.
     */
    app.delete('/messages/:id', (req: Request, res: Response) => {
      this.messages_controller.deleteMessage(req, res); // Call deleteMessage from MessagesController
    });
  }
}
