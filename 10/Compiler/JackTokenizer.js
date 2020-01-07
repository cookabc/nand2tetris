const fs = require("fs")

const symbolPattern = "(.*)(\\{|\\}|\\(|\\)|\\[|\\]|\\.|\\,|;|\\+|-|\\*|/|&|\\||<|>|=|~)(.*)"
const commentPattern = "(^//.*)|(^/\\*.*)|^\\*.*"
const keywordPattern = "class|constructor|function|method|field|static|var|int|char|boolean|void|true|false|null|this|let|do|if|else|while|return"
const identifierPattern = "^[^\d\W]\w*"
const intPattern = "\\d+"
const stringPattern = "^\"[^\"]+\"$"

const keywordList = ["class", "constructor", "function", "method", "field", "static", "var", "int", "char", "boolean", "void", "true", "false", "null", "this", "let", "do", "if", "else", "while", "return"]
const symbolList = ["{", "}", "(", ")", "[", "]", ".", ",", ";", "+", "-", "*", "/", "&", "|", "<", ">", "=", "~"];

module.exports = class JackTokenizer {
  constructor(inputFile) {
    this.tokens = []
    const inputStream = fs.readFileSync(inputFile, "utf-8")
    this.tokens = this.generateTokens(inputStream)
    console.log(this.tokens)
    this.currentToken = null
  }

  generateTokens(inputStream) {
    const tokens = []
    const tokenLines = inputStream.split("\n")
    tokenLines.forEach(i => {
      let tokenLine = i.replace(commentPattern, " ")
      if (tokenLine.includes("\"")) {
        console.log(tokenLine)
      }
      if (tokenLine.length > 1 && tokenLine.match(symbolPattern)) {
        symbolList.forEach(s => {
          if (tokenLine.includes(s)) {
            tokenLine = tokenLine.replace(s, " " + s + " ");
          }
        })
      }
      tokenLine.trim().split(" ").forEach(t => {
        if (t) tokens.push(t)
      })
    })
    return tokens
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
