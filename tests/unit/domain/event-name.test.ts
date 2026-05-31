import { describe, it, expect } from "vitest";
import { EventName } from "../../../packages/common/event-bus/src/event-name/index";

describe("EventName parser", () => {
  it("parses valid event name", () => {
    const result = EventName.parse("fs:file-selected");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.module).toBe("fs");
      expect(result.value.event).toBe("file-selected");
    }
  });

  it("rejects missing colon", () => {
    const result = EventName.parse("ab");
    expect(result.ok).toBe(false);
  });

  it("rejects empty module", () => {
    const result = EventName.parse(":event");
    expect(result.ok).toBe(false);
  });

  it("rejects empty event", () => {
    const result = EventName.parse("module:");
    expect(result.ok).toBe(false);
  });

  it("rejects too many colons", () => {
    const result = EventName.parse("a:b:c");
    expect(result.ok).toBe(false);
  });

  it("rejects identifier starting with digit", () => {
    const result = EventName.parse("123:event");
    expect(result.ok).toBe(false);
  });
});
