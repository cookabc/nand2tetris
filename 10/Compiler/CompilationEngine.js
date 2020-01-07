module.exports = class CompilationEngine {
  constructor(tokenizer) {
    this.tokenizer = tokenizer
    this.output = []
    this.spacing = ""
  }

  writeTag(word, type) {
    this.output.push(this.spacing + "<" + type + "> " + word + " </" + type + ">")
  }

  increaseSpacing() {
    this.spacing += "\t"
  }

  decreaseSpacing() {
    this.spacing = this.spacing.substring(1)
  }

  checkSymbol(s) {
    if (s === "<") { s = "&lt;" }
    else if (s === ">") { s = "&gt;" }
    else if (s === "&") { s = "&amp;" }

    if (this.tokenizer.symbol() === s) {
      this.writeTag(s, "symbol");
      return true;
    } else {
      return false;
    }
  }

  compileClass() {
    this.tokenizer.advance()
    if (this.tokenizer.keyword() == "CLASS") {
      // write class
      this.output.push(this.spacing + "<class>")
      this.increaseSpacing()

      this.writeTag(this.tokenizer.token(), "keyword")

      // write class name
      this.tokenizer.advance()
      if (this.tokenizer.tokenType() == "IDENTIFIER") {
        this.writeTag(this.tokenizer.identifier(), "identifier")
      } else {
        console.warn("illegal class name identifier")
        return
      }

      // write {
      this.tokenizer.advance()
      if (!this.checkSymbol("{")) {
        console.warn("no openning { for class")
        return
      }

      // parse potential classVarDec
      this.tokenizer.advance()
      while (["STATIC", "FIELD"].includes(this.tokenizer.keyword())) {
        this.compileClassVarDec()
        this.tokenizer.advance()
      }

      // parse potential subroutineDec
      while (["CONSTRUCTOR", "FUNCTION", "METHOD"].includes(this.tokenizer.keyword())) {
        this.compileSubRoutine()
        this.tokenizer.advance()
      }

      // write }
      if (!this.checkSymbol("}")) {
        console.warn("no closing } for class")
        return
      }

      if (this.tokenizer.hasMoreTokens()) {
        console.warn("addtional tokens after closing }")
      }

      // write close tag of class
      this.decreaseSpacing()
      this.output.push(this.spacing + "</class>")
      this.output.forEach(o => console.log(o))
    } else {
      console.warn("does not start with class")
      return
    }
  }
  compileClassVarDec() { }
  compileSubroutine() { }
  compileParameterList() { }
  compileVarDec() { }
  compileStatements() { }
  compileDo() { }
  compileLet() { }
  compileWhile() { }
  compileReturn() { }
  compileIf() { }
  compileExpression() { }
  compileTerm() { }
  compileExpressionList() { }
}
