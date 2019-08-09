import { TokenType } from "./TokenType";

export default class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = lexer.getNextToken();
  }
  /**
     json
    : value
    ; */
  paseJSON() {
    this.parseValue();
  }

  /**obj 
    : "{" pair (,pair)* "}"
    ; */
  parseObject() {
    this.eat(TokenType.OpenBrace);
    this.parsePair();
    while (this.currentToken.type == TokenType.COMMA) {
      this.parsePair();
    }
    this.eat(TokenType.CloseBrace);
  }

  /** String: value(,comment)? */
  parsePair() {
    this.eat(TokenType.StringLiteral);
    this.parseValue();
    if (this.currentToken == TokenType.COMMA) {
      this.eat(TokenType.SingleLineComment);
    }
  }

  /**match the current token and get the next */
  eat(tokenType) {
    if (this.currentToken.type == tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      console.error(
        `this.currentToken is ${JSON.stringify(
          this.currentToken
        )} doesn't match the input ${tokenType}`
      );
    }
  }

  /**
     * value
    : BITSTRING
    | NUMBER
    | obj
    | 'true'
    | 'false'
    ; */
  parseValue() {
    switch (this.currentToken.type) {
      case TokenType.OpenBrace:
        this.parseObject();
        break;
    }
  }
}
