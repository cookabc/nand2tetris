const fs = require('fs')
const path = require('path')

module.exports = class Writer {

  constructor(outputFile) {
    this.arthJumpFlag = 0
    this.assembleOut = ''
    this.labelCount = 0
    this.labelRegex = new RegExp("^[^0-9][0-9A-Za-z\\_\\:\\.\\$]+")
    this.outputFile = this.setFileName(outputFile)
  }

  setFileName(fileName) {
    if (fs.lstatSync(fileName).isDirectory()) {
      return `${path.resolve(fileName)}/${path.basename(fileName)}.asm`
    } else {
      return `${path.resolve(fileName).replace('.vm', '.asm')}`
    }
  }

  writeArithmetic(command) {
    let output
    switch (command) {
      case 'add':
        output = this.arithmeticTemplate1() + 'M=M+D\n'
        break
      case 'sub':
        output = this.arithmeticTemplate1() + 'M=M-D\n'
        break
      case 'and':
        output = this.arithmeticTemplate1() + 'M=M&D\n'
        break
      case 'or':
        output = this.arithmeticTemplate1() + 'M=M|D\n'
        break
      case 'gt':
        output = this.arithmeticTemplate2("JLE")
        this.arthJumpFlag += 1
        break
      case 'lt':
        output = this.arithmeticTemplate2("JGE")
        this.arthJumpFlag += 1
        break
      case 'eq':
        output = this.arithmeticTemplate2("JNE")
        this.arthJumpFlag += 1
        break
      case 'not':
        output =
          `
@SP
A=M-1
M=!M
`
        break
      case 'neg':
        output =
          `
D=0
@SP
A=M-1
M=D-M
`
        break
      default:
        break
    }
    this.assembleOut += output
  }
  arithmeticTemplate1() {
    return `@SP
AM=M-1
D=M
A=A-1
`
  }
  arithmeticTemplate2(type) {
    return `@SP
AM=M-1
D=M
A=A-1
D=M-D
@FALSE${this.arthJumpFlag}
D;${type}
@SP
A=M-1
M=-1
@CONTINUE${this.arthJumpFlag}
0;JMP
(FALSE${this.arthJumpFlag})
@SP
A=M-1
M=0
(CONTINUE${this.arthJumpFlag})
`
  }

  writePushPop(command, segment, index) {
    let output
    switch (segment) {
      case 'constant':
        output =
          `
@${index}
D=A
@SP
A=M
M=D
@SP
M=M+1
`
        break
      case 'local':
        output = {
          'POP': this.popTemplate("LCL", index, false),
          'PUSH': this.pushTemplate("LCL", index, false)
        }[command]
        break
      case 'argument':
        output = {
          'POP': this.popTemplate("ARG", index, false),
          'PUSH': this.pushTemplate("ARG", index, false)
        }[command]
        break
      case 'this':
        output = {
          'POP': this.popTemplate("THIS", index, false),
          'PUSH': this.pushTemplate("THIS", index, false)
        }[command]
        break
      case 'that':
        output = {
          'POP': this.popTemplate("THAT", index, false),
          'PUSH': this.pushTemplate("THAT", index, false)
        }[command]
        break
      case 'temp':
        output = {
          'POP': this.popTemplate("R5", index + 5, false),
          'PUSH': this.pushTemplate("R5", index + 5, false)
        }[command]
        break
      case 'pointer':
        if (index === 0) {
          output = {
            'POP': this.popTemplate("THIS", index, true),
            'PUSH': this.pushTemplate("THIS", index, true)
          }[command]
        }
        if (index === 1) {
          output = {
            'POP': this.popTemplate("THAT", index, true),
            'PUSH': this.pushTemplate("THAT", index, true)
          }[command]
        }
        break
      case 'static':
        output = {
          'POP': this.popTemplate(`${index + 16}`, index, true),
          'PUSH': this.pushTemplate(`${index + 16}`, index, true)
        }[command]
        break
      default:
        break
    }
    this.assembleOut += output
  }
  popTemplate(segment, index, flag) {
    const str = flag
      ? 'D=A'
      :
      `D=M
@${index}
D=D+A
`
    return `
@${segment}
${str}
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
`
  }
  pushTemplate(segment, index, flag) {
    const str = flag
      ? ''
      :
      `@${index}
A=D+A
D=M`
    return `
@${segment}
D=M
${str}
@SP
A=M
M=D
@SP
M=M+1
`
  }

  writeInit() {
    this.assembleOut += `@256
D=A
@SP
M=D
`
    this.writeCall('Sys.init', 0)
  }

  writeLabel(label) {
    this.assembleOut += `
(${label})
`
  }

  writeGoto(label) {
    this.assembleOut += `
@${label}
0;JMP`
  }

  writeIf(label) {
    this.assembleOut += `
@SP
AM=M-1
D=M
A=A-1
@${label}
D;JNE
`
  }

  writeCall(functionName, numArgs) {
    this.labelCount += 1
    const newLabel = `RETURN_LABEL${this.labelCount}`
    let output = `
@${newLabel}
D=A
@SP
A=M
M=D
@SP
M=M+1
`
    output += this.pushTemplate("LCL", 0, true)
    output += this.pushTemplate("ARG", 0, true)
    output += this.pushTemplate("THIS", 0, true)
    output += this.pushTemplate("THAT", 0, true)
    output += `
@SP
D=M
@5
D=D-A
@${numArgs}
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@${functionName}
0;JMP
(${newLabel})
`
    this.assembleOut += output
  }

  writeReturn() {
    this.assembleOut += `
@LCL
D=M
@R11
M=D
@5
A=D-A
D=M
@R12
M=D
${this.popTemplate("ARG", 0, false)}
@ARG
D=M
@SP
M=D+1
${this.preFrameTemplate("THAT")}
${this.preFrameTemplate("THIS")}
${this.preFrameTemplate("ARG")}
${this.preFrameTemplate("LCL")}
@R12
A=M
0;JMP
`
  }
  preFrameTemplate(position) {
    return `
@R11
D=M-1
AM=D
D=M
@${position}
M=D
`
  }

  writeFunction(functionName, numLocals) {
    this.assembleOut += `(${functionName})`
    for (let i = 0; i < numLocals; i++) {
      this.writePushPop('PUSH', 'constant', 0)
    }
  }

  close() {
    fs.writeFile(this.outputFile, this.assembleOut, (err) => {
      if (err) {
        throw err
      }
    })
  }
}
