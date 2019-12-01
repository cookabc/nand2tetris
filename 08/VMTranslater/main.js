const fs = require('fs')
const path = require('path')
const Parser = require('./parser.js')
const Writer = require('./code-writer')

const processFile = (writer, file) => {
  const commands = fs.readFileSync(file, 'utf-8')
  const parser = new Parser(commands.split('\r\n'))
  while (parser.hasMoreCommands()) {
    parser.advance()
    const commandType = parser.commandType()
    switch (commandType) {
      case 'ARITHMETIC':
        writer.writeArithmetic(parser.arg1())
        break;
      case 'POP':
        writer.writePushPop(commandType, parser.arg1(), parser.arg2())
        break;
      case 'PUSH':
        writer.writePushPop(commandType, parser.arg1(), parser.arg2())
        break;
      case 'LABEL':
        writer.writeLabel(parser.arg1())
        break;
      case 'GOTO':
        writer.writeGoto(parser.arg1())
        break;
      case 'IF':
        writer.writeIf(parser.arg1())
        break;
      case 'RETURN':
        writer.writeReturn()
        break;
      case 'FUNCTION':
        writer.writeFunction(parser.arg1(), parser.arg2())
        break;
      case 'CALL':
        writer.writeCall(parser.arg1(), parser.arg2())
        break;
      default:
        break;
    }
  }
  writer.close()
}

if (process.argv.length !== 3) {
  console.warn('\nUsage:\tnode VMtranslator/main.js [filename|directory]\n')
} else {
  const inputFile = process.argv[2]
  const writer = new Writer(inputFile)
  writer.writeInit()
  if (fs.lstatSync(inputFile).isDirectory()) {
    fs.readdir(inputFile, (err, files) => {
      if (err) {
        throw err
      }
      files.forEach(file => {
        if (file.endsWith('.vm')) {
          processFile(writer, path.resolve(`${path.resolve(inputFile)}/${file}`))
        }
      })
    })
  } else {
    processFile(writer, path.resolve(inputFile))
  }
  writer.close()
}
