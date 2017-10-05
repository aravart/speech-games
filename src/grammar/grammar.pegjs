Start = command:( Connect / Get / Delete / Change / Run / Next / Stay) { return command }

Article = "an" / "a"
Type = "set" / "if" / "repeat" / "comparison" / "math" / "arithmetic" / "print" / "text" / "number" / "variable" / "connect" / "turn" / "pen" / "color" / "move"

Connect = "connect" _ block:BlockToken _ where:BlockPosition { return {
  "action": "connect",
  "blockId": block,
  "where": where
} }

BlockType = type:Type _ "block" { return type }

BlockToken = "block" _ number:Number { return number }

BlockPosition = position:Position _ block:BlockToken { return {
  "blockId": block,
  "position": position
} }

Position = "under" / "inside"

Number = digits:[0-9]+ { return parseInt(digits.join(""), 10); }
Word = value:[a-zA-Z]+ { return value.join("") }
Words = car:Word cdr:(" " w:Word { return w })* { return [car].concat(cdr).join(" ") }
NewTextField = car:Word cdr:(!"in block" .)* { return [car].concat(cdr.join("")).join("").replace(new RegExp(",","g"),"").trim()  }

Get = "get" _ Article _ type:BlockType { return {
  "action": "get",
  "type": type,
} }

Delete = "delete" _ block:BlockToken { return {
  "action": "delete",
  "blockId": block
} }

Change = "change" _ originalValue:Value _ "in" _ block:BlockToken _ "to" _ newValue:Value { return {
  "action": "modify",
  "new": newValue,
  "original": originalValue,
  "blockId": block,
} }

ChangeVerb = "change" / "set" / "modify"

Run = "run the program" { return {
  "action": "run"
} }

Next = "go to the next level" { return {
  "action": "next"
} }

Stay = "stay on this level" { return {
  "action": "stay"
} }

Value = Number / Word
//Left = ("to" / "into") _ "the" _ ("first blank" / "first field" / "lefthand side" / "left") _ "of" { return "lhs" }
//Right = ("to" / "into") _ "the" _ ("second blank" / "second field" /"last field" / "last blank"/ "righthand side" / "right") _ "of" { return "rhs" }
//Top = ("at" / "to" / "into") _ "the" _ "top" _ "of" { return "top" }
//NameVerb = "called" / "named"
//Property = OperationName / ComparisonName / NumberName / FieldName / "variable name" / "name" / "text"
//
//
//PropertyValuePair = OperationPair / ComparisonPair / NamePair / NumberPair / TextPair / FieldPair
//
//OperationPair = (OperationName / OperationValue) _ "to" _ value:OperationValue { return {
//  "property": "operation",
//  "value": value
//} }
//
//OperationName = ("operation" / "operator") { return "operation" }
//OperationValue = Addition / Subtraction / Multiplication / Division / Exponentiation
//Addition = ("addition" / "get" / "plus") { return "+" }
//Subtraction = ("subtract" / "minus" / "subtraction") { return "-" }
//Multiplication = ("multiply" / "times" / "multiplication") { return "*" }
//Division = ("divide" / "division") { return "/" }
//Exponentiation = ("power" / "exponentiation") { return "^" }
//
//NamePair = "variable name to" _ name:Word { return {
//  "property": "name",
//  "value": name
//} }
//
//ComparisonPair = (ComparisonName / ComparisonValue) _ "to" _ comparison:ComparisonValue { return {
// "property": "comparison",
//"value": comparison
//} }
//
//ComparisonName = "comparison"
//ComparisonValue = 
//  "equals" { return "==" } /
//  ("not equals" / "not equal to") { return "!=" /** this doesn't work yet :( */} /
//  "greater than or equal to" { return ">=" } /
//  "less than or equal to" { return "<=" } /
//  "greater than" { return ">" } /
//  "less than" { return "<" }
//
//NumberPair = (NumberName / Number) _ "to" _ number:Number { return {
//  "property": "number",
//  "value": number
//} }
//NumberName = "number"
//
//TextPair = "text" _ "to" _ text:(NewTextField) { return {
//  "property": "text",
//  "value": text
//} }
//
//FieldPair = FieldName _ "to" _ text:(Number/Words) { return {
//  "property": "value",
//  "value": text
//} }
//
//FieldName = ("field" / "middle" / "blank" / "value" / "property")
//
//
//Undo = "undo" { return {
//  "action": "undo"
//} }
//Redo = "redo" { return {
//  "action": "redo"
//} }
//
//Menu = actionType:MenuVerb _ "the"?  _ menuName:Word _ ("menu"/"toolbox") { return {
//  "action": "menu",
//  "actionType": actionType,
//  "menu": menuName
//} }
//MenuVerb = "open" / "close"
//
_   = ' '*
