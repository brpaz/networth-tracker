import { type EventHandler, defineEventHandler, createError } from 'h3';
import { NotFoundError } from '../errors';

export function defineApiHandler(handler: EventHandler): EventHandler {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw createError({ statusCode: 404, statusMessage: error.message });
      }
      throw error;
    }
  });
}
