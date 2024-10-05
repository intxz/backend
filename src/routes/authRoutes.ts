import { Application, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

export class AuthRoutes {
  private auth_controller: AuthController = new AuthController(); // Initialize an instance of AuthController
  private auth_middleware: AuthMiddleware = new AuthMiddleware(); // Initialize an instance of AuthMiddleware

  /**
   * Configures authentication-related routes for the Express application.
   * 
   * @param app - The Express application object.
   */
  public route(app: Application) {
    /**
     * Route for handling user login requests.
     * The client sends login credentials (e.g., username and password) in the request body.
     * If the credentials are valid, the AuthController generates and returns a JWT.
     */
    app.post('/login', (req: Request, res: Response) => {
      this.auth_controller.login(req, res); // Call the login method from AuthController
    });

    /**
     * Example of a protected route.
     * The user must provide a valid JWT in the Authorization header to access this route.
     * The middleware verifies the token before allowing access to the resource.
     */
    app.get(
      '/protected', // The path for the protected resource
      (req: Request, res: Response, next: NextFunction) => {
        this.auth_middleware.verifyToken(req, res, next); // Verify the token using the AuthMiddleware
      },
      (req: Request, res: Response) => {
        // If the token is valid, respond with a message and user info
        res.json({ message: 'This is a protected route', user: req.body.user });
      }
    );
  }
}
