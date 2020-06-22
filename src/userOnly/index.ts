/**
 * Allows only the given user IDs to interact with the bot - anyone else
 * receives no response, as if the bot had no backend running.
 *
 * @packageDocumentation
 * @module UserOnly
 */

export * from "./IUserOnlyContext.d";
export * from "./userOnlyMiddleware";
