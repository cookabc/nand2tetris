module.exports = class SymbolTable {
  constructor() {
    this.classTable = {}
    this.subTable = {}
    this.kindIndex = {
      static: 0,
      field: 0,
      arg: 0,
      var: 0
    }
  }

  startSubroutine() {
    this.subTable = {}
    this.kindIndex.arg = 0
    this.kindIndex.var = 0
  }

  define(name, type, kind) {
    kind = kind.toLowerCase()
    if (['static', 'field'].includes(kind)) {
      this.classTable[name] = [type, kind, this.kindIndex[kind]++]
    }
    if (['arg', 'var'].includes(kind)) {
      this.subTable[name] = [type, kind, this.kindIndex[kind]++]
    }
  }

  varCount(kind) {
    kind = kind.toLowerCase()
    return this.kindIndex[kind]
  }

  kindOf(name) {
    if (this.subTable.hasOwnProperty(name)) {
      return this.subTable[name][1]
    }
    if (this.classTable.hasOwnProperty(name)) {
      return this.classTable[name][1]
    }
  }

  typeOf(name) {
    if (this.subTable.hasOwnProperty(name)) {
      return this.subTable[name][0]
    }
    if (this.classTable.hasOwnProperty(name)) {
      return this.classTable[name][0]
    }
  }

  indexOf(name) {
    if (this.subTable.hasOwnProperty(name)) {
      return this.subTable[name][2]
    }
    if (this.classTable.hasOwnProperty(name)) {
      return this.classTable[name][2]
    }
  }
}
