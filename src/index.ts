/**
 * Sample bot using the [[AlertManager]] and [[UserOnly]] modules.
 *
 * @packageDocumentation
 * @module Bot
 */
/* global console */

import { bot } from "./bot";

bot().catch(console.error);
