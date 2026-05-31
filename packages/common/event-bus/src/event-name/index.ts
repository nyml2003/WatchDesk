import { EventName as EventNameFactory } from "../ids";
import type { ParseResult } from "../parser";
import { EventNameParser } from "../parser";

function parse(raw: string): ParseResult {
  const parser = new EventNameParser(raw);
  return parser.parse();
}

function toString(name: string): string {
  return name;
}

function moduleOf(name: string): string {
  const idx = name.indexOf(":");
  return name.slice(0, idx);
}

function eventOf(name: string): string {
  const idx = name.indexOf(":");
  return name.slice(idx + 1);
}

export const EventName = {
  of(module: string, event: string): ReturnType<typeof EventNameFactory.of> {
    return EventNameFactory.of(module, event);
  },
  parse,
  toString,
  moduleOf,
  eventOf,
};
