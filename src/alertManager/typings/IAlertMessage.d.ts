/**
 * @packageDocumentation
 * @module AlertManager
 */

/**
 * Materialization structure containing the full chain of ids for an alert
 */
export interface IAlertMessage {

  /** Telegram API user ID */
  userId: string;

  /** Telegram API chat ID */
  chatId: string;

  /** Telegram API message ID */
  messageId: string;

  /** Alert hash from [[Alert.hash]] */
  alertHash: string;
}
