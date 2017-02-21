Start = ("please")? _ command:( Put / Add / Delete / Change / Run / Undo / Redo / Separate / Menu / Next / Stay) { return command }

Article = "an" / "a"
Type = "set" / "if" / "repeat" / "comparison" / "math" / "arithmetic" / "print" / "text" / "number" / "variable" / "put" / "turn" / "pen" / "color" / "move"

Put = "put" _ block:BlockToken _ where:Where { return {
  "action": "put",
  "blockId": block,
  "where": where
} }

BlockType = type:Type _ "block" { return type }

BlockToken = "block" _ number:Number { return number }

Where = BlockPosition

BlockPosition = position:Position _ block:BlockToken { return {
  "blockId": block,
  "position": position
} }

Position = Before / After / Left / Right / Top / "inside"

Before = ("above" / "before") { return "before" }
After = ("below" / "after") { return "after" }
Left = ("to" / "into") _ "the" _ ("first blank" / "first field" / "lefthand side" / "left") _ "of" { return "lhs" }
Right = ("to" / "into") _ "the" _ ("second blank" / "second field" /"last field" / "last blank"/ "righthand side" / "right") _ "of" { return "rhs" }
Top = ("at" / "to" / "into") _ "the" _ "top" _ "of" { return "top" }

Number = digits:[0-9]+ { return parseInt(digits.join(""), 10); }
Word = value:[a-zA-Z]+ { return value.join("") }
Words = car:Word cdr:(" " w:Word { return w })* { return [car].concat(cdr).join(" ") }
NewTextField = car:Word cdr:(!"in block" .)* { return [car].concat(cdr.join("")).join("").replace(new RegExp(",","g"),"").trim()  }

Add = "add" _ Article _ type:BlockType { return {
  "action": "add",
  "type": type,
} }

NameVerb = "called" / "named"

Delete = "delete" _ block:(BlockToken / "all") { return {
  "action": "delete",
  "blockId": block
} }

Change = "change" _ ("the")? _ ordinal:(Ordinal/"") _ property:Property _ "in" _ block:BlockToken _ "to" _ value:Value { return {
  "action": "modify",
  "property": property,
  "value": value,
  "blockId": block,
  "ordinal": ordinal
} }

Ordinal = ord:("first" / "second" / "third" ) { return ord }

ChangeVerb = "change" / "set" / "modify"

Property = OperationName / ComparisonName / NumberName / FieldName / "variable name" / "name" / "text"

Value = OperationValue / ComparisonValue / Number / Number / Words

PropertyValuePair = OperationPair / ComparisonPair / NamePair / NumberPair / TextPair / FieldPair

OperationPair = (OperationName / OperationValue) _ "to" _ value:OperationValue { return {
  "property": "operation",
  "value": value
} }

OperationName = ("operation" / "operator") { return "operation" }
OperationValue = Addition / Subtraction / Multiplication / Division / Exponentiation
Addition = ("addition" / "add" / "plus") { return "+" }
Subtraction = ("subtract" / "minus" / "subtraction") { return "-" }
Multiplication = ("multiply" / "times" / "multiplication") { return "*" }
Division = ("divide" / "division") { return "/" }
Exponentiation = ("power" / "exponentiation") { return "^" }

NamePair = "variable name to" _ name:Word { return {
  "property": "name",
  "value": name
} }

ComparisonPair = (ComparisonName / ComparisonValue) _ "to" _ comparison:ComparisonValue { return {
  "property": "comparison",
  "value": comparison
} }

ComparisonName = "comparison"
ComparisonValue = 
  "equals" { return "==" } /
  ("not equals" / "not equal to") { return "!=" /** this doesn't work yet :( */} /
  "greater than or equal to" { return ">=" } /
  "less than or equal to" { return "<=" } /
  "greater than" { return ">" } /
  "less than" { return "<" }

NumberPair = (NumberName / Number) _ "to" _ number:Number { return {
  "property": "number",
  "value": number
} }
NumberName = "number"

TextPair = "text" _ "to" _ text:(NewTextField) { return {
  "property": "text",
  "value": text
} }

FieldPair = FieldName _ "to" _ text:(Number/Words) { return {
  "property": "value",
  "value": text
} }

FieldName = ("field" / "middle" / "blank" / "value" / "property")

Run = ("run the program") { return {
  "action": "run"
} }

Undo = "undo" { return {
  "action": "undo"
} }
Redo = "redo" { return {
  "action": "redo"
} }

Separate = SeparateVerb _ block:BlockToken _ (("from"/"and") _ BlockToken)? { return {
  "action": "separate",
  "blockId": block
} }

Menu = actionType:MenuVerb _ "the"?  _ menuName:Word _ ("menu"/"toolbox") { return {
  "action": "menu",
  "actionType": actionType,
  "menu": menuName
} }
MenuVerb = "open" / "close"

SeparateVerb = "separate"

Next = ("go to the")? _ "next level" { return {
  "action": "next"
} }

Stay = "stay on this level" { return {
  "action": "stay"
} }

_   = ' '*
