import { describe, it, expect } from "vitest";

describe("raf check", () => {
  it("checks RAF availability", () => {
    expect(typeof window.requestAnimationFrame).toBe("function");
  });
  it("checks global act", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(Object.keys(require("react")));
  });
});
