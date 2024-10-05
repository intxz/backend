import { Request, Response } from 'express';
import { query } from '../config/database';

export class MessagesController {

  /**
   * Creates a new message in a chat.
   *
   * @param req - The request object containing the chat ID, message content, and user ID from the token.
   * @param res - The response object to send back the created message or an error message.
   * @returns A response with the newly created message or an error message.
   */
  public async createMessage(req: Request, res: Response): Promise<Response> {
    const { chat_id, content } = req.body; // Extract chat ID and message content from the request body
    const requestingUserId = req.body.user.id; // Extract user ID from the token

    try {
      // Verify that the chat exists and the user is authorized
      const chat = await query('SELECT id FROM chats WHERE id = $1 AND user_id = $2', [
        chat_id,
        requestingUserId,
      ]);

      if (chat.rows.length === 0) {
        return res.status(404).json({ message: 'Chat not found or user not authorized' });
      }

      // Insert the new message into the database
      const newMessage = await query(
        'INSERT INTO messages (chat_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
        [chat_id, requestingUserId, content]
      );

      // Return the created message
      return res.status(201).json({
        message: 'Message created successfully',
        messageData: newMessage.rows[0],
      });
    } catch {
      // In case of an error, return a 500 status with an error message
      return res.status(500).json({ error: 'Error creating message' });
    }
  }

  /**
   * Retrieves all messages in a chat for a user.
   *
   * @param req - The request object containing the chat ID and user ID from the token.
   * @param res - The response object to send back the list of messages or an error message.
   * @returns A response with the list of messages in the chat or an error message.
   */
  public async getMessages(req: Request, res: Response): Promise<Response> {
    const { chat_id } = req.body; // Extract chat ID from the request body
    const requestingUserId = req.body.user.id; // Extract user ID from the token

    try {
      // Verify that the chat exists and the user is authorized
      const chat = await query('SELECT id FROM chats WHERE id = $1 AND user_id = $2', [
        chat_id,
        requestingUserId,
      ]);

      if (chat.rows.length === 0) {
        return res.status(404).json({ message: 'Chat not found or user not authorized' });
      }

      // Retrieve messages from the chat
      const messages = await query('SELECT * FROM messages WHERE chat_id = $1', [chat_id]);

      // Return the list of messages
      return res.status(200).json({
        message: 'Messages retrieved successfully',
        messageData: messages.rows,
      });
    } catch (error) {
      // In case of an error, return a 500 status with an error message
      console.error(error);
      return res.status(500).json({ error: 'Error retrieving messages' });
    }
  }

  /**
   * Updates the content of a message.
   *
   * @param req - The request object containing the message ID and new content.
   * @param res - The response object to send back the updated message or an error message.
   * @returns A response with the updated message or an error message.
   */
  public async updateMessage(req: Request, res: Response): Promise<Response> {
    const { id } = req.params; // Extract message ID from request params
    const { content } = req.body; // Extract new content from the request body
    const requestingUserId = req.body.user.id; // Extract user ID from the token

    try {
      // Verify that the message exists and the user is authorized
      const message = await query('SELECT * FROM messages WHERE id = $1 AND user_id = $2', [
        id,
        requestingUserId,
      ]);

      if (message.rows.length === 0) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Update the message content
      const updatedMessage = await query(
        'UPDATE messages SET content = $1 WHERE id = $2 RETURNING *',
        [content, id]
      );

      // Return the updated message
      return res.status(200).json({
        message: 'Message updated successfully',
        messageData: updatedMessage.rows[0],
      });
    } catch {
      // In case of an error, return a 500 status with an error message
      return res.status(500).json({ error: 'Error updating message' });
    }
  }

  /**
   * Deletes a message.
   *
   * @param req - The request object containing the message ID.
   * @param res - The response object to send back a success message or an error message.
   * @returns A response confirming message deletion or an error message.
   */
  public async deleteMessage(req: Request, res: Response): Promise<Response> {
    const { id } = req.params; // Extract message ID from request params
    const requestingUserId = req.body.user.id; // Extract user ID from the token

    try {
      // Verify that the message exists and the user is authorized
      const message = await query('SELECT * FROM messages WHERE id = $1 AND user_id = $2', [
        id,
        requestingUserId,
      ]);

      if (message.rows.length === 0) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Delete the message from the database
      await query('DELETE FROM messages WHERE id = $1', [id]);

      // Return a success message
      return res.status(200).json({
        message: 'Message deleted successfully',
      });
    } catch {
      // In case of an error, return a 500 status with an error message
      return res.status(500).json({
        error: 'Error deleting message',
      });
    }
  }
}
