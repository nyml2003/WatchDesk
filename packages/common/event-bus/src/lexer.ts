export type TokenKind = "IDENT" | "COLON" | "EOF" | "ILLEGAL";

export interface Token {
  readonly kind: TokenKind;
  readonly lexeme: string;
  readonly position: number;
}

export class Lexer {
  private input: string;
  private pos: number = 0;
  private ch: string = "";

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  nextToken(): Token {
    this.skipWhitespace();

    if (this.isEOF()) {
      return { kind: "EOF", lexeme: "", position: this.pos };
    }

    const start = this.pos;

    if (this.isLetter(this.ch)) {
      const lexeme = this.readIdent();
      return { kind: "IDENT", lexeme, position: start };
    }

    if (this.ch === ":") {
      this.readChar();
      return { kind: "COLON", lexeme: ":", position: start };
    }

    const lexeme = this.ch;
    this.readChar();
    return { kind: "ILLEGAL", lexeme, position: start };
  }

  private readIdent(): string {
    const start = this.pos - 1;
    while (this.isIdentChar(this.ch)) {
      this.readChar();
    }
    return this.input.slice(start, this.pos - 1);
  }

  private isLetter(ch: string): boolean {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
  }

  private isIdentChar(ch: string): boolean {
    return this.isLetter(ch) || (ch >= "0" && ch <= "9") || ch === "-" || ch === "_";
  }

  private isEOF(): boolean {
    return this.pos >= this.input.length;
  }

  private readChar(): void {
    this.ch = this.pos < this.input.length ? (this.input[this.pos] ?? "") : "";
    this.pos++;
  }

  private skipWhitespace(): void {
    while (!this.isEOF() && (this.ch === " " || this.ch === "\t")) {
      this.readChar();
    }
  }
}
