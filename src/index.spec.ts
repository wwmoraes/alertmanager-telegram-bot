it("should start bot successfully", async () => {
  const bot = await (await import("./index")).bot;

  expect(bot).toBeDefined();
});
