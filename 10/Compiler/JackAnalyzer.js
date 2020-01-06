const JackTokenizer = require("./JackTokenizer");
const CompilationEngine = require("./CompilationEngine");


const inputFile = process.argv[2]
const tokenizer = new JackTokenizer(inputFile);
const compilationEngine = new CompilationEngine(tokenizer);

compilationEngine.compileClass()
