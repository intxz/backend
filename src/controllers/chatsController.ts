import { Request, Response } from 'express';
import { query } from '../config/database';

export class ChatsController {

  /**
   * Creates a new chat associated with a user.
   *
   * @param req - The request object containing the chat title in the body and the user ID from the token.
   * @param res - The response object to send back the created chat or an error message.
   * @returns A response with the newly created chat or an error message.
   */
  public async createChat(req: Request, res: Response): Promise<Response> {
    const { title } = req.body; // Extract chat title from the request body
    const user_id = req.body.user.id; // Extract user ID from the token

    try {
      // Insert the new chat into the database and return the result
      const newChat = await query(
        'INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *',
        [user_id, title]
      );
      return res.status(201).json(newChat.rows[0]); // Return the created chat
    } catch {
      // In case of an error, return a 500 status with an error message
      return res.status(500).json({ error: 'Error creating chat' });
    }
  }

  /**
   * Retrieves all chats associated with a specific user.
   *
   * @param req - The request object containing the user ID in the body.
   * @param res - The response object to send back the list of chats or an error message.
   * @returns A response with the list of chats for the user or an error message.
   */
  public async getChats(req: Request, res: Response): Promise<Response> {
    const { user_id } = req.body; // Extract user ID from the request body

    try {
      // Query the database to fetch all chats for the user
      const chats = await query('SELECT * FROM chats WHERE user_id = $1', [user_id]);

      // Return the list of chats
      return res.status(200).json(chats.rows);
    } catch {
      // In case of an error, return a 500 status with an error message
      return res.status(500).json({ error: 'Error fetching chats' });
    }
  }

  /**
   * Updates the title of a chat.
   *
   * @param req - The request object containing the new title and the user ID from the token.
   * @param res - The response object to send back the updated chat or an error message.
   * @returns A response with the updated chat or an error message if not authorized.
   */
  public async updateChat(req: Request, res: Response): Promise<Response> {
    const { id } = req.params; // Extract chat ID from request params
    const { title } = req.body; // Extract new chat title from the request body
    const requestingUserId = req.body.user.id; // Extract user ID from the token

    try {
      // Update the chat title for the user and return the result
      const updateChat = await query(
        'UPDATE chats SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [title, id, requestingUserId]
      );

      if (updateChat.rows.length === 0) {
        // If no rows are updated, return a 404 status
        return res.status(404).json({ message: 'Chat not found or you are not authorized' });
      }

      // Return the updated chat
      return res.status(200).json(updateChat.rows[0]);
    } catch {
      // In case of an error, return a 500 status with an error message
      return res.status(500).json({ error: 'Error updating chat' });
    }
  }

  /**
   * Deletes a chat associated with a user.
   *
   * @param req - The request object containing the chat ID in the params and the user ID from the token.
   * @param res - The response object to send back a success message or an error message.
   * @returns A response confirming chat deletion or an error message.
   */
  public async deleteChat(req: Request, res: Response): Promise<Response> {
    const { id } = req.params; // Extract chat ID from request params
    const user_id = req.body.user.id; // Extract user ID from the token

    try {
      // Delete the chat for the user and return the result
      const deleteChat = await query(
        'DELETE FROM chats WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, user_id]
      );

      if (deleteChat.rowCount === 0) {
        // If no rows are deleted, return a 404 status
        return res.status(404).json({ message: 'Chat not found or you are not authorized' });
      }

      // Return a success message
      return res.status(200).json({ message: 'Chat deleted successfully' });
    } catch {
      // In case of an error, return a 500 status with an error message
      return res.status(500).json({ error: 'Error deleting chat' });
    }
  }
}
