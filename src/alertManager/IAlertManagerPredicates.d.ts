/**
 * @packageDocumentation
 * @module AlertManager
 */

/**
 * Predicates used on the levelgraph database to link resources
 */
export const enum IAlertManagerPredicates {

  /** `user-id` `chat-on` `chat-id` */
  ChatOn = "chat-on",

  /** `chat-id` `has-message` `message-id` */
  HasMessage = "has-message",

  /** `message-id` `alerts` `alert-hash` */
  Alerts = "alerts"
}
