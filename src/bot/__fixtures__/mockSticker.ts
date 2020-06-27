import {mock} from "jest-mock-extended";
import {Sticker} from "telegraf/typings/telegram-types";

export const mockStickerValid = mock<Sticker>({
  emoji: "👍",
  file_id: "MOCK_STICKER_FILE_ID",
  set_name: "MOCK_STICKER_SET_NAME"
});

export default {
  mockStickerValid
};
