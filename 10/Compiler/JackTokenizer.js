const fs = require("fs")

const symbolPattern = "(.*)(\\{|\\}|\\(|\\)|\\[|\\]|\\.|\\,|;|\\+|-|\\*|/|&|\\||<|>|=|~)(.*)"
const commentPattern = "(^//.*)|(^/\\*.*)|^\\*.*"
const keywordPattern = "class|constructor|function|method|field|static|var|int|char|boolean|void|true|false|null|this|let|do|if|else|while|return"
const identifierPattern = "^[^\\d\\W]\\w*\\Z"
const intPattern = "\\d+"
const stringPattern = "^\"[^\"]+\"$"

const keywordList = ["class", "method", "function", "constructor", "int", "boolean", "char", "void", "var", "static", "field", "let", "do", "if", "else", "while", "return", "true", "false", "null", "this"]

module.exports = class JackTokenizer {
  constructor(inputFile) {
    const inputStream = fs.readFileSync(inputFile, "utf-8")
    const tokenLines = inputStream.split("\n")
    tokenLines.forEach(i => {
      const tokenLine = i.replace(/\s|(\/\/).+/g, " ")
      const tokens = tokenLine.trim().split(" ")
      this.tokens = [...this.tokens, ...tokens]
    })
    this.currentToken = null
    this.currentTokenType = null
  }

  hasMoreTokens() {
    return this.tokens.length > 0
  }

  advance() {
    if (this.hasMoreTokens()) {
      this.currentToken = this.tokens.shift()
    }
  }

  tokenType() {
    if (this.currentToken.match(keywordPattern)) {
      this.currentTokenType = "KEYWORD"
    } else if (this.currentToken.match(symbolPattern)) {
      this.currentTokenType = "SYMBOL"
    } else if (this.currentToken.match(identifierPattern)) {
      this.currentTokenType = "IDENTIFIER"
    } else if (this.currentToken.match(intPattern)) {
      this.currentTokenType = "INT_CONST"
    } else if (this.currentToken.match(stringPattern)) {
      this.currentTokenType = "STRING_CONST"
    }
    return this.currentTokenType
  }

  keyWord() {
    if (this.tokenType() === "KEYWORD" && keywordList.includes(this.currentToken)) {
      return this.currentToken.toUpperCase()
    }
  }

  symbol() {
    if (this.currentTokenType === "SYMBOL") {
      if (this.currentToken === "<") { return "&lt;" }
      else if (this.currentToken === ">") { return "&gt;" }
      else if (this.currentToken === "&") { return "&amp;" }
      else { return this.currentToken }
    }
  }

  identifier() {
    if (this.tokenType() === "IDENTIFIER") {
      return this.currentToken
    }
  }

  intVal() {
    if (this.tokenType() === "INT_CONST") {
      return parseInt(this.currentToken)
    }
  }

  stringVal() {
    if (this.tokenType() === "STRING_CONST") {
      return this.currentToken.replace("\"", "")
    }
  }
}
