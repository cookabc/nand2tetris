const fs = require("fs")

const commentPattern = "(//.*)|(/\\*.*)|\\*.*"
const keywordPattern = "class|constructor|function|method|field|static|var|int|char|boolean|void|true|false|null|this|let|do|if|else|while|return"
const symbolPattern = "[\\&\\*\\+\\(\\)\\.\\/\\,\\-\\]\\;\\~\\}\\|\\{\\>\\=\\[\\<]"
const intPattern = "[0-9]+"
const stringPattern = "\"[^\"\n]*\""
const identifierPattern = "[\\w_]+"

const combinedRegex = (...regexes) => new RegExp("(" + regexes.map(regex => new RegExp(regex).source).join(")|(") + ")", "g")
const tokenPattern = combinedRegex(keywordPattern, symbolPattern, intPattern, stringPattern, identifierPattern)

const keywordList = ["class", "constructor", "function", "method", "field", "static", "var", "int", "char", "boolean", "void", "true", "false", "null", "this", "let", "do", "if", "else", "while", "return"]

module.exports = class JackTokenizer {
  constructor(inputFile) {
    const inputStream = fs.readFileSync(inputFile, "utf-8")
    this.tokens = this.generateTokens(inputStream)
    this.currentToken = null
  }

  generateTokens(inputStream) {
    const tokens = []
    const tokenLines = inputStream.split("\n")
    tokenLines.forEach(i => {
      let tokenLine = i.replace(new RegExp(commentPattern, "g"), "")
      if (tokenLine) {
        const matches = tokenLine.matchAll(tokenPattern)
        for (const match of matches) {
          tokens.push(match[0])
        }
      }
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
