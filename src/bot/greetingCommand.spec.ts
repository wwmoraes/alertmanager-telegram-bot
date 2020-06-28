/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/no-empty-function */

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
  jest.resetModuleRegistry();
});

it("should greet back", async () => {
  const greetingCommand = await (await import("./greetingCommand")).greetingCommand;
  const mockBotContextValid = await (await import("./__fixtures__/mockBotContext")).mockBotContextValid;

  await greetingCommand(mockBotContextValid);

  expect(mockBotContextValid.reply).toHaveBeenCalled();
  expect(mockBotContextValid.reply).toHaveBeenCalledWith("Hey there", undefined);
});
