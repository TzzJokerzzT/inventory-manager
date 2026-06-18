import { describe, expect, it } from "vitest";

describe("vitest setup", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("resolves async operations", async () => {
    const value = await Promise.resolve("auth-foundation");
    expect(value).toBe("auth-foundation");
  });
});
