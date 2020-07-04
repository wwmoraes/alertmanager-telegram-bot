/**
 * @packageDocumentation
 * @module AlertManager
 */

export interface ICallbackData extends Record<string, unknown> {
  module: "am",
  do: "silence",
  params: { [key:string]: string }
}
