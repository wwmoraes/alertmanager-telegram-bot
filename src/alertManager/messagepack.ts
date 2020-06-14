import { encode, decode } from 'messagepack';

export const encodeToString = (obj: object): string =>
  String.fromCharCode(...Array.from(encode(obj)));

export const decodeFromString = <T>(str: string): T =>
  decode<T>((new Uint8Array(str.split("").map(x => x.charCodeAt(0))).buffer));
