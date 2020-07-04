import levelup from "levelup";
import encode from "encoding-down";
import memdown from "memdown";
import type {IAlert} from "../typings/IAlert";

const AlertManagerActual = jest.requireActual("../AlertManager").AlertManager;

/**
 * class with a stub constructor to avoid creating the databases on disk, thus
 * avoiding high IO and problems like path conflicts, setup and cleanup
 */
export class AlertManager extends AlertManagerActual {
  constructor () {
    super(
      levelup(encode(memdown<string, string>(), {
        valueEncoding: "string",
        keyEncoding: "string"
      })),
      levelup(encode(memdown<string, IAlert>(), {
        valueEncoding: "string",
        keyEncoding: "json"
      }))
    );
  }
}
