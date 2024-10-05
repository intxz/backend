import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from '../config/database';

const SECRET_KEY: string = 'api+jwt'; // Define the secret key for JWT signing

export class AuthController {

  /**
   * This method handles user login by validating the provided credentials.
   * It checks if the username exists in the database, verifies the password,
   * and if both are correct, it generates a JWT token.
   *
   * @param req - The request object containing the username and password in the body.
   * @param res - The response object to send back the token or an error message.
   * @returns A response with a JWT token if successful, or an error message.
   */
  public async login(req: Request, res: Response): Promise<Response> {
    const { username, password } = req.body; // Extract username and password from the request body

    try {
      // Check if the user exists in the database
      const user = await query('SELECT * FROM users WHERE username = $1', [username]);

      if (user.rows.length === 0) {
        // If no user is found, return an error message
        return res.status(400).json({ message: 'User not found' });
      }

      // Validate the provided password against the stored password hash
      const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

      if (!validPassword) {
        // If the password is invalid, return an error message
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Update the user's last login timestamp in the database
      await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [
        user.rows[0].id,
      ]);

      // Generate a JWT token with user information and a 1-hour expiration time
      const token = jwt.sign(
        {
          id: user.rows[0].id,
          username: user.rows[0].username,
          role: user.rows[0].role,
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      // Return the generated token as a response
      return res.status(200).json({ token });
    } catch {
      // In case of any error, return a 500 status with an error message
      return res.status(500).json({ error: 'Error logging in' });
    }
  }
}
