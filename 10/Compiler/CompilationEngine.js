module.exports = class CompilationEngine {
  constructor(tokenizer) {
    this.tokenizer = tokenizer
  }

  compileClass() { }
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
