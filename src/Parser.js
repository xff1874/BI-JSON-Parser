import { TokenType } from "./TokenType";
import * as AstNode from "./Ast";
import { objectExpression } from "@babel/types";

export default class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    // this.sym = {}; //暂时记录comment的一些信息，类似global symbol.
    this.currentToken = lexer.getNextToken();
    this.isParseValidate = true; //flag to make sure pass the parser test
  }
  /**
     json
    : value
    ; */
  paseJSON() {
    return this.parseValue();
  }

  /**obj 
    : "{" pair (,pair)* "}"
    ; */
  parseObject() {
    let _obj = new AstNode.JsonObject();
    this.eat(TokenType.OpenBrace);
    let _pairs = [];
    _pairs.push(this.parsePair());
    while (this.currentToken.type == TokenType.COMMA) {
      this.eat(TokenType.COMMA);
      _pairs(this.parsePair());
    }
    this.eat(TokenType.CloseBrace);
    _obj.pairs = _pairs;
    return _obj;
  }

  /** String: value(,comment)? */
  parsePair() {
    let _pair = new AstNode.JsonPair();
    const _key = this.currentToken.value;
    let _pkey = new AstNode.JsonKey(_key);
    _pair.key = _pkey;
    this.eat(TokenType.StringLiteral);
    this.eat(TokenType.COLON);
    let _value = this.parseValue();
    if (this.currentToken.type == TokenType.SingleLineComment) {
      // this.sym[_key] = this.currentToken.value;
      _value.comment = new AstNode.JsonComment(this.currentToken.value);
      this.eat(TokenType.SingleLineComment);
    }
    _pair.value = _value;
    return _pair;
  }

  //STRING(|STRING)*
  parseString() {
    let arr = [];
    arr.push(new AstNode.JsonString(this.currentToken.value));
    this.eat(TokenType.StringLiteral);
    while (this.currentToken.type == TokenType.BitOr) {
      this.eat(TokenType.BitOr);
      arr.push(new AstNode.JsonString(this.currentToken.value));
      this.eat(TokenType.StringLiteral);
    }
    return arr;
  }

  /**match the current token and get the next */
  eat(tokenType) {
    if (this.currentToken.type == tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      //   console.error(
      //     `this.currentToken is ${JSON.stringify(
      //       this.currentToken
      //     )} doesn't match the input ${tokenType}`
      //   );
      this.isParseValidate = false;
      throw new Error(
        `this.currentToken is ${JSON.stringify(
          this.currentToken
        )} doesn't match the input ${tokenType}`
      );
    }
  }

  /**
     * value
    : STRING(|STRING)*
    | NUMBER
    | obj
    | 'true'
    | 'false'
    ; */
  parseValue() {
    let _valueObj = new AstNode.JsonValue();
    const _current = this.currentToken;
    switch (this.currentToken.type) {
      case TokenType.OpenBrace:
        _valueObj.child.push(this.parseObject());
        break;
      case TokenType.StringLiteral:
        _valueObj.child.push(this.parseString());
        break;
      case TokenType.NUMBER:
        this.eat(TokenType.NUMBER);
        _valueObj.child.push(new AstNode.JsonNumber(_current.value));
        break;
      // case TokenType.SingleLineComment:
      //   this.eat(TokenType.SingleLineComment);
      //   _valueObj.comment = new AstNode.JsonComment(_current.value);
      //   break;
    }

    return _valueObj;
  }

  // getComment(key) {
  //   return this.sym[`"${key}"`];
  // }
}
