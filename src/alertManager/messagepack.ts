/**
 * @packageDocumentation
 * @module AlertManager
 */

import { decode, encode } from "messagepack";

/**
 * encodes an object into a messagepack string
 *
 * @param {Object.<string, any>} obj object to encode
 * @returns {string} encoded string
 */
export const encodeToString = (obj: Record<string, unknown>): string =>
  String.fromCharCode(...Array.from(encode(obj)));

/**
 * decodes a messagepack string into an object
 *
 * @template T
 * @param {string} str encoded string
 * @returns {T} object with decoded data
 */
export const decodeFromString = <T>(str: string): T =>
  decode<T>(new Uint8Array(str.split("").map((char) =>
    char.charCodeAt(0))).buffer);

export default {
  encodeToString,
  decodeFromString
};
