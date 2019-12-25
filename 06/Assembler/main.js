const fs = require('fs')
const Code = require('./code')
const Parser = require("./parser")
const SymbolTable = require("./symbol-table")

const fileName = process.argv[2]

const symbolTable = new SymbolTable()
const code = new Code()
let parser = new Parser(fileName)
let ramAddress = 16

fs.readFile(fileName, 'utf-8', (err, data) => {
  if (err) {
    throw err
  }

  firstPass(parser, symbolTable)
  parser = new Parser(fileName)
  let outStream = ''
  secondPass(parser, symbolTable, code, outStream)

  const outName = fileName.replace(".asm", ".hack")
  fs.writeFile(outName, outStream, (err) => {
    if (err) {
      throw err
    }
  })
})

const firstPass = (parser, symbolTable) => {
  let counter = -1
  let symbol = null
  while (parser.hasMoreCommands()) {
    parser.advance()
    if (parser.commandType() == 'L') {
      symbol = parser.symbol()
      symbolTable.addEntry(symbol, counter + 1)
    } else { counter++ }
  }
}

const secondPass = (parser, symbolTable, code, outStream) => {
  while (parser.hasMoreCommands()) {
    parser.advance()
    if (parser.commandType() == "A") {
      const symbol = parser.symbol()
      const command = generateACommand(symbol, symbolTable)
      outStream += command
    } else if (parser.commandType() == "C") {
      const dest = code.dest(parser.dest())
      const comp = code.comp(parser.comp())
      const jump = code.jump(parser.jump())
      outStream += `111${comp}${dest}${jump}\n`
    }
  }
}

const generateACommand = (symbol, symbolTable) => {
  let binary
  if (isNaN(parseInt(symbol))) {
    if (symbolTable.table.contains(symbol)) {
      binary = int2Binary(symbolTable.getAddress(symbol))
    } else {
      binary = int2Binary(ramAddress++)
      symbolTable.addEntry(symbol, ramAddress)
    }
  } else {
    binary = int2Binary(symbol)
  }
  return binary
}

const int2Binary = (num) => {
  let binary = parseInt(num).toString(2)
  while (binary.length !== 16) {
    binary = `0${binary}`
  }
  return binary
}
