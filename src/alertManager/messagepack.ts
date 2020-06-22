/**
 * @packageDocumentation
 * @module AlertManager
 */

import {decode, encode} from "messagepack";

export const encodeToString = (obj: Record<string, unknown>): string =>
  String.fromCharCode(...Array.from(encode(obj)));

export const decodeFromString = <T>(str: string): T =>
  decode<T>(new Uint8Array(str.split("").map((char) =>
    char.charCodeAt(0))).buffer);

export default {
  encodeToString,
  decodeFromString
};
