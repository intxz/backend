import { Application, Request, Response, NextFunction } from 'express';
import { ChatsController } from '../controllers/chatsController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

export class ChatsRoutes {
  private chat_controller: ChatsController = new ChatsController(); // Initialize an instance of ChatsController
  private auth_middleware: AuthMiddleware = new AuthMiddleware(); // Initialize an instance of AuthMiddleware

  /**
   * Configures the chat-related routes for the Express application.
   * All chat routes are protected by the authentication middleware.
   * 
   * @param app - The Express application object.
   */
  public route(app: Application) {
    /**
     * Middleware applied to all chat routes to verify the JWT token.
     * If the token is invalid, the request will be blocked.
     */
    app.use('/chats', (req: Request, res: Response, next: NextFunction) => {
      this.auth_middleware.verifyToken(req, res, next); // Verify token before accessing chat routes
    });

    /**
     * Route for creating a new chat.
     * The request body should contain the required data (e.g., title).
     * A new chat will be created and associated with the authenticated user.
     */
    app.post('/chats', (req: Request, res: Response) => {
      this.chat_controller.createChat(req, res); // Call createChat from ChatsController
    });

    /**
     * Route for retrieving all chats belonging to the authenticated user.
     * Responds with a list of chats the user has created.
     */
    app.get('/chats', (req: Request, res: Response) => {
      this.chat_controller.getChats(req, res); // Call getChats from ChatsController
    });

    /**
     * Route for updating a chat's details (e.g., title) by chat ID.
     * The chat ID is provided as a URL parameter.
     */
    app.put('/chats/:id', (req: Request, res: Response) => {
      this.chat_controller.updateChat(req, res); // Call updateChat from ChatsController
    });

    /**
     * Route for deleting a chat by chat ID.
     * Only the creator of the chat is authorized to delete it.
     */
    app.delete('/chats/:id', (req: Request, res: Response) => {
      this.chat_controller.deleteChat(req, res); // Call deleteChat from ChatsController
    });
  }
}
