import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

const SECRET_KEY: string = 'api+jwt';

export class UserController {
  
  /**
   * Registers a new user in the system.
   * 
   * @param req - The request object containing username, password, email, and role_name.
   * @param res - The response object to return the newly registered user or an error message.
   * @returns A response with the registered user and a JWT token or an error message.
   */
  public async register(req: Request, res: Response): Promise<Response> {
    const { username, password, email, role_name = 'user' } = req.body;

    try {
      // Check if the user already exists based on username or email
      const userExist = await query('SELECT * FROM users WHERE username = $1 OR email = $2', [
        username,
        email,
      ]);

      if (userExist.rows.length > 0) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      // Generate a hashed password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert the new user into the database
      const newUser = await query(
        'INSERT INTO users (username, password_hash, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, passwordHash, email, role_name]
      );

      const user = newUser.rows[0];

      // Check if the role exists
      const role = await query('SELECT * FROM roles WHERE role_name = $1', [role_name]);

      if (role.rows.length === 0) {
        return res.status(400).json({ message: 'Role not found' });
      }

      // Insert the user-role relationship
      await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
        user.id,
        role.rows[0].id,
      ]);

      // Generate a JWT token for the registered user
      const token = jwt.sign(
        { id: user.id, username: user.username, role: role_name },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      return res.status(201).json({
        message: 'User registered successfully',
        user,
        role: role_name,
        token,
      });
    } catch {
      return res.status(500).json({ error: 'Error registering user' });
    }
  }

  /**
   * Retrieves all users.
   * 
   * @param req - The request object.
   * @param res - The response object to return the list of users or an error message.
   * @returns A response with a list of users or an error message.
   */
  public async getUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await query('SELECT id, username, email, role FROM users');
      return res.status(200).json(users.rows);
    } catch {
      return res.status(500).json({ error: 'Error fetching users' });
    }
  }

  /**
   * Retrieves a specific user by ID.
   * 
   * @param req - The request object containing the user ID in the params.
   * @param res - The response object to return the user or an error message.
   * @returns A response with the user data or an error message.
   */
  public async getUserById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const user = await query('SELECT id, username, email, role FROM users WHERE id = $1', [id]);

      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user.rows[0]);
    } catch {
      return res.status(500).json({ error: 'Error fetching user' });
    }
  }

  /**
   * Updates the profile of the requesting user.
   * 
   * @param req - The request object containing the user ID in the params and updated fields in the body.
   * @param res - The response object to return the updated user or an error message.
   * @returns A response with the updated user data or an error message.
   */
  public async updateUser(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { username, email } = req.body;
    const requestingUserId = req.body.user.id;

    // Ensure the requesting user can only update their own account
    if (requestingUserId.toString() !== id) {
      return res.status(403).json({ message: 'You can only update your own account' });
    }

    const fieldsToUpdate: { [key: string]: unknown } = {};
    if (username) fieldsToUpdate['username'] = username;
    if (email) fieldsToUpdate['email'] = email;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    try {
      const queryFields = Object.keys(fieldsToUpdate)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');

      const queryValues = Object.values(fieldsToUpdate);

      const queryText = `UPDATE users SET ${queryFields} WHERE id = $${
        queryValues.length + 1
      } RETURNING *`;
      const updatedUser = await query(queryText, [...queryValues, id]);

      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser.rows[0],
      });
    } catch {
      return res.status(500).json({ error: 'Error updating profile' });
    }
  }

  /**
   * Updates any user's profile by an admin.
   * 
   * @param req - The request object containing the user ID and fields to update.
   * @param res - The response object to return the updated user or an error message.
   * @returns A response with the updated user data or an error message.
   */
  public async updateAnyUser(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Ensure there are fields to update
    if (!username && !email && !role) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    try {
      const fieldsToUpdate: { [key: string]: unknown } = {};
      if (username) fieldsToUpdate['username'] = username;
      if (email) fieldsToUpdate['email'] = email;
      if (role) fieldsToUpdate['role'] = role;

      const queryFields = Object.keys(fieldsToUpdate)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');

      const queryValues = Object.values(fieldsToUpdate);

      const queryText = `UPDATE users SET ${queryFields} WHERE id = $${queryValues.length + 1} RETURNING *`;
      queryValues.push(id);

      const updatedUser = await query(queryText, queryValues);

      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser.rows[0],
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Error updating user' });
    }
  }

  /**
   * Deletes the requesting user's account and related data.
   * 
   * @param req - The request object containing the user ID in the params.
   * @param res - The response object to return a success message or an error message.
   * @returns A response confirming account deletion or an error message.
   */
  public async deleteUser(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const requestingUserId = req.body.user.id;

    if (requestingUserId.toString() !== id) {
      return res.status(403).json({ message: 'You can only delete your own account' });
    }

    try {
      await query('DELETE FROM messages WHERE user_id = $1', [id]);
      await query('DELETE FROM chats WHERE user_id = $1', [id]);
      await query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      const user_delete = await query('DELETE FROM users WHERE id = $1', [id]);

      if (user_delete.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ message: 'User and related data deleted successfully' });
    } catch {
      return res.status(500).json({ error: 'Error deleting user' });
    }
  }

  /**
   * Deletes any user and their related data by an admin.
   * 
   * @param req - The request object containing the user ID in the params.
   * @param res - The response object to return a success message or an error message.
   * @returns A response confirming account deletion or an error message.
   */
  public async deleteAnyUser(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      await query('DELETE FROM messages WHERE user_id = $1', [id]);
      await query('DELETE FROM chats WHERE user_id = $1', [id]);
      await query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      const user_delete = await query('DELETE FROM users WHERE id = $1', [id]);

      if (user_delete.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ message: 'User and related data deleted successfully' });
    } catch {
      return res.status(500).json({ error: 'Error deleting user' });
    }
  }
}
