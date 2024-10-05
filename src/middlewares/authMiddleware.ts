import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY: string = 'api+jwt';

export class AuthMiddleware {
  
  /**
   * Middleware to verify the JWT token in the request header.
   * 
   * @param req - The incoming request, expected to contain a JWT in the Authorization header.
   * @param res - The response object, used to send error messages if the token is invalid or missing.
   * @param next - The next middleware function to call if the token is valid.
   * @returns A 403 response if the token is not provided or invalid, otherwise proceeds to the next middleware.
   */
  public verifyToken(req: Request, res: Response, next: NextFunction): Response | void {
    // Extract the token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1];

    // If the token is missing, return a 403 Forbidden response
    if (!token) {
      return res.status(403).json({ message: 'Token not provided' });
    }

    try {
      // Verify the JWT token using the secret key
      const decoded = jwt.verify(token, SECRET_KEY) as {
        id: number;
        username: string;
        role: string;
      };

      // Attach the decoded token payload to the request body for later use
      req.body.user = decoded;

      // Proceed to the next middleware function
      next();
    } catch {
      // If the token is invalid, return a 401 Unauthorized response
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  /**
   * Middleware to verify if the user has the required role(s).
   * 
   * @param allowedRoles - An array of roles allowed to access the resource.
   * @returns A function that checks if the user has a valid role and proceeds or denies access.
   */
  public verifyRole(
    allowedRoles: string[]
  ): (req: Request, res: Response, next: NextFunction) => Response | void {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
      const { role } = req.body.user;

      // Check if the user's role is in the list of allowed roles
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }

      // Proceed to the next middleware function if the user has the appropriate role
      next();
    };
  }
}
