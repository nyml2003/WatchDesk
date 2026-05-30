import type { Token, TokenKind } from "./lexer";
import { Lexer } from "./lexer";

export interface EventNameAST {
  readonly module: string;
  readonly event: string;
}

export type ParseError = {
  readonly message: string;
  readonly position: number;
};

function parseError(message: string, position: number): ParseError {
  return { message, position };
}

type Result<T> = { ok: true; value: T } | { ok: false; error: ParseError };

export type ParseResult = Result<EventNameAST>;

export class EventNameParser {
  private lexer: Lexer;
  private curToken: Token;
  private peekToken: Token;

  constructor(input: string) {
    this.lexer = new Lexer(input);
    this.curToken = this.lexer.nextToken();
    this.peekToken = this.lexer.nextToken();
  }

  parse(): ParseResult {
    const mod = this.parseModule();
    if (!mod.ok) return mod;

    const colon = this.expectToken("COLON");
    if (!colon.ok) return colon;

    const evt = this.parseEvent();
    if (!evt.ok) return evt;

    const eof = this.expectToken("EOF");
    if (!eof.ok) return eof;

    return {
      ok: true,
      value: { module: mod.value, event: evt.value },
    };
  }

  private parseModule(): Result<string> {
    const tok = this.expectToken("IDENT");
    if (!tok.ok) return tok;

    if (tok.value.lexeme.length > 0 && !/[a-zA-Z]/.test(tok.value.lexeme[0])) {
      return {
        ok: false,
        error: parseError(
          `Module must start with letter: "${tok.value.lexeme}"`,
          tok.value.position,
        ),
      };
    }

    return { ok: true, value: tok.value.lexeme };
  }

  private parseEvent(): Result<string> {
    const tok = this.expectToken("IDENT");
    if (!tok.ok) return tok;

    if (tok.value.lexeme.length > 0 && !/[a-zA-Z]/.test(tok.value.lexeme[0])) {
      return {
        ok: false,
        error: parseError(
          `Event must start with letter: "${tok.value.lexeme}"`,
          tok.value.position,
        ),
      };
    }

    return { ok: true, value: tok.value.lexeme };
  }

  private expectToken(kind: TokenKind): Result<Token> {
    if (this.curToken.kind === kind) {
      return { ok: true, value: this.next() };
    }

    return {
      ok: false,
      error: parseError(
        `Expected ${kind}, got ${this.curToken.kind} ("${this.curToken.lexeme}")`,
        this.curToken.position,
      ),
    };
  }

  private next(): Token {
    const tok = this.curToken;
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
    return tok;
  }
}
