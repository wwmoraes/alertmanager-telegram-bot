/**
 * @packageDocumentation
 * @module Bot
 */

import {mock} from "jest-mock-extended";
import {StickerSet} from "telegraf/typings/telegram-types";

export const mockStickerSetValid = mock<StickerSet>({
  name: "sticker_pack",
  stickers: [
    {
      file_id: "facepalm1",
      emoji: "🤦‍♂️"
    },
    {
      file_id: "smile1",
      emoji: "🙂"
    }
  ]
});

export default {
  mockStickerSetValid
};
