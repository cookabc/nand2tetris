const fs = require("fs")

const symbolPattern = "(.*)(\\{|\\}|\\(|\\)|\\[|\\]|\\.|\\,|;|\\+|-|\\*|/|&|\\||<|>|=|~)(.*)"
const commentPattern = "(^//.*)|(^/\\*.*)|^\\*.*"
const keywordPattern = "class|constructor|function|method|field|static|var|int|char|boolean|void|true|false|null|this|let|do|if|else|while|return"
const identifierPattern = "^[^\d\W]\w*"
const intPattern = "\\d+"
const stringPattern = "^\"[^\"]+\"$"

const keywordList = ["class", "constructor", "function", "method", "field", "static", "var", "int", "char", "boolean", "void", "true", "false", "null", "this", "let", "do", "if", "else", "while", "return"]

module.exports = class JackTokenizer {
  constructor(inputFile) {
    this.tokens = []
    const inputStream = fs.readFileSync(inputFile, "utf-8")
    const tokenLines = inputStream.split("\n")
    tokenLines.forEach(i => {
      const tokenLine = i.replace(commentPattern, " ")
      const tokens = tokenLine.trim().split(" ")
      tokens.forEach(t => { if (t) this.tokens.push(t) })
    })
    this.currentToken = null
  }

  hasMoreTokens() {
    return this.tokens.length > 0
  }

  advance() {
    if (this.hasMoreTokens()) {
      this.currentToken = this.tokens.shift()
    }
  }

  token() {
    return this.currentToken
  }

  tokenType() {
    let tokenType
    if (this.currentToken.match(keywordPattern)) {
      tokenType = "KEYWORD"
    } else if (this.currentToken.match(symbolPattern)) {
      tokenType = "SYMBOL"
    } else if (this.currentToken.match(identifierPattern)) {
      tokenType = "IDENTIFIER"
    } else if (this.currentToken.match(intPattern)) {
      tokenType = "INT_CONST"
    } else if (this.currentToken.match(stringPattern)) {
      tokenType = "STRING_CONST"
    }
    return tokenType
  }

  keyword() {
    if (this.tokenType() === "KEYWORD" && keywordList.includes(this.currentToken)) {
      return this.currentToken.toUpperCase()
    }
  }

  symbol() {
    if (this.tokenType() === "SYMBOL") {
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
