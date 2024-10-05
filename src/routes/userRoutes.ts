import { Application, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

export class UserRoutes {
  private user_controller: UserController = new UserController(); // Initialize an instance of UserController
  private auth_middleware: AuthMiddleware = new AuthMiddleware(); // Initialize an instance of AuthMiddleware

  /**
   * Configures the user-related routes for the Express application.
   * Some user routes are protected by authentication and/or admin role.
   * 
   * @param app - The Express application object.
   */
  public route(app: Application) {
    /**
     * Middleware applied to all user routes to verify the JWT token.
     * This ensures only authenticated users can access these routes.
     */
    app.use('/users', (req: Request, res: Response, next: NextFunction) => {
      this.auth_middleware.verifyToken(req, res, next); // Verify JWT token for all /users routes
    });

    /**
     * Route for user registration.
     * Allows new users to register with their username, password, email, and role.
     */
    app.post('/register', (req: Request, res: Response) => {
      this.user_controller.register(req, res); // Call register method from UserController
    });

    /**
     * Route to retrieve all users (admin only).
     * This route is restricted to users with an 'admin' role.
     */
    app.get(
      '/users',
      (req: Request, res: Response, next: NextFunction) => {
        this.auth_middleware.verifyRole(['admin'])(req, res, next); // Verify that the user has admin role
      },
      (req: Request, res: Response) => {
        this.user_controller.getUsers(req, res); // Call getUsers method from UserController
      }
    );

    /**
     * Route to retrieve a specific user by their ID.
     * Allows authenticated users to fetch their own or any specific user's data.
     */
    app.get('/users/:id', (req: Request, res: Response) => {
      this.user_controller.getUserById(req, res); // Call getUserById method from UserController
    });

    /**
     * Route for updating a user's profile by ID.
     * Users can update their own profile using this route.
     */
    app.put('/users/profile/:id', (req: Request, res: Response) => {
      this.user_controller.updateUser(req, res); // Call updateUser method from UserController
    });

    /**
     * Route for updating any user's data (admin only).
     * This route is restricted to users with an 'admin' role.
     */
    app.put(
      '/users/:id',
      (req: Request, res: Response, next: NextFunction) => {
        this.auth_middleware.verifyRole(['admin'])(req, res, next); // Verify that the user has admin role
      },
      (req: Request, res: Response) => {
        this.user_controller.updateAnyUser(req, res); // Call updateAnyUser method from UserController
      }
    );

    /**
     * Route for deleting a user's own profile by ID.
     * Allows authenticated users to delete their own account.
     */
    app.delete('/users/profile/:id', (req: Request, res: Response) => {
      this.user_controller.deleteUser(req, res); // Call deleteUser method from UserController
    });

    /**
     * Route for deleting any user's account (admin only).
     * This route is restricted to users with an 'admin' role.
     */
    app.delete(
      '/users/:id',
      (req: Request, res: Response, next: NextFunction) => {
        this.auth_middleware.verifyRole(['admin'])(req, res, next); // Verify that the user has admin role
      },
      (req: Request, res: Response) => {
        this.user_controller.deleteAnyUser(req, res); // Call deleteAnyUser method from UserController
      }
    );
  }
}
