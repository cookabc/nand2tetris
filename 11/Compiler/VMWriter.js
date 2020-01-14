const fs = require('fs')

module.exports = class VMWriter {
  constructor(outFile) {
    this.output = ''
    this.outFile = outFile
  }

  writePush(segment, index) {
    this.output += `push ${segment} ${index}\n`
  }

  writePop(segment, index) {
    this.output += `pop ${segment} ${index}\n`
  }

  writeArithmetic(command) {
    this.output += `${command}\n`
  }

  writeLabel(label) {
    this.output += `label ${label}\n`
  }

  writeGoto(label) {
    this.output += `goto ${label}\n`
  }

  writeIf(label) {
    this.output += `if-goto ${label}\n`
  }

  writeCall(name, nArgs) {
    this.output += `call ${name} ${nArgs}\n`
  }

  writeFunction(name, nLocals) {
    this.output += `function ${name} ${nLocals}\n`
  }

  writeReturn() {
    this.output += `return\n`
  }

  writeFile() {
    fs.writeFile(this.outFile, this.output, err => {
      if (err) throw err
    })
  }
}
