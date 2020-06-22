/**
 * Middleware that handles Prometheus Alertmanager alerts, with a stateful
 * context to provide interactions such as silencing and visualization of
 * related alerts, silences created and generator URLs (e.g. graphs) through
 * inline keyboards and NLP. This enables the users to act upon the alert
 * directly through the chat.
 * @packageDocumentation
 * @module AlertManager
 */

export * from "./IAlertManagerContext";
export * from "./alertManagerComposer";
export * from "./setupAlertManagerContext";
