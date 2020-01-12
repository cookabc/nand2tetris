module.exports = class SymbolTable {
  constructor() {}
  
  startSubroutine() {}

  define(name, type, kind) {}

  varCount(kind) {
    return 0
  }

  kindOf(name) {
    return ""
  }

  typeOf(name) {
    return ""
  }

  indexOf(name) {
    return -1
  }
}