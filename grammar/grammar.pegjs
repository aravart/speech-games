Start = ("please" _)? command:( Move / Add / Remove / Change / Run / Undo / Redo / Separate) { return command }

Article = "an" / "a" / "the"
Type = "set" / "if" / "repeat" / "comparison" / "math" / "arithmetic" / "print" / "text" / "number" / "variable" / "move" / "turn" / "pen" / "color"

Move = MoveVerb _ block:BlockToken _ where:(Where / "away") { return {
    "action": "move",
    "block": block,
    "where": where
} }

MoveVerb = "move" / "attach"

BlockType = Article _ type:Type (_ "block")? { return type }

BlockToken = _ ("blocks"/"block")? _ ("number")? _ number:Number { return number }

Where = BlockPosition / Trash

BlockPosition = position:Position _ block:BlockToken { return {
    "block": block,
    "position": position
} }

Trash = "to the trash" { return "trash" }

Position = Above / Below / Left / Right / Top / Away / Inside / To

Number = digits:[0-9]+ { return parseInt(digits.join(""), 10); }
Word = value:[a-zA-Z]+ { return value.join("") }
Words = car:Word cdr:(" " w:Word { return w })* { return [car].concat(cdr).join(" ") }
NewTextField = car:Word cdr:(!"in block" .)* { return [car].concat(cdr.join("")).join("").replace(new RegExp(",","g"),"").trim()  }
Add = Add4 / Add3 / Add2 / Add1

Add1 = AddVerb _ type:BlockType { return {
    "action": "add",
    "type": type,
    "where": "",
    "value": ""
} }

Add2 = AddVerb _ type:BlockType _ where:Where { return {
    "action": "add",
    "type": type,
    "where": where,
    "value": ""
} }

Add3 = AddVerb _ type:BlockType _ NameVerb _  name:Word{ return {
    "action": "add",
    "type": type,
    "where": "",
    "value": name
} }

Add4 =  AddVerb _ type:BlockType _ NameVerb _  name:Word _ where:Where { return {
    "action": "add",
    "type": type,
    "where": where,
    "value": name
} }

AddVerb = "add" / "insert" / "make"
NameVerb = "called" / "named"

Remove = RemoveVerb _ block:(BlockToken / "all") { return {
    "action": "delete",
    "block": block
} }

RemoveVerb = "delete" / "remove" / "erase"

Change = Change1 / Change2 / Change3 / Change4

Change1 = "in" _ block:BlockToken _ ("please" _)? ChangeVerb _ ("the")? _ ordinal:(Ordinal / "") _ pair:PropertyValuePair { console.log(pair); return  {
      "action": "modify",
      "property": pair.property,
      "value": pair.value,
      "block": block,
      "ordinal": ordinal
} }

Change2 = ChangeVerb _ ("the")? _ ordinal:(Ordinal / "") _ pair:PropertyValuePair _ "in" block:BlockToken ( _ "please")? { return {
    "action": "modify",
    "property": pair.property,
    "value": pair.value,
    "block": block,
    "ordinal": ordinal
} }

Change3 = ChangeVerb _ ("the")? _ ordinal:(Ordinal /"") _ property:Property _ "in" _ block:BlockToken _ "to" _ value:Value ( _ "please")? { return {
    "action": "modify",
    "property": property,
    "value": value,
    "block": block,
    "ordinal": ordinal
} }

Change4 = ChangeVerb _ "in" _ block:BlockToken _ ("the")? _ ordinal:(Ordinal / "") _ pair:PropertyValuePair (_ "please")? { return {
   "action": "modify",
   "property": pair.property,
   "value": pair.value,
   "block": block,
   "ordinal": ordinal
} }

Ordinal = ord:("first" / "second" / "third" / "fourth" / "last") { return ord }

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
ComparisonValue = "equals" { return "==" } /
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

Above = ("above" / "before") { return "above" }
Below = ("below" / "after") { return "below" }
Left = ("to" / "into") _ "the" _ ("first blank" / "first field" / "lefthand side" / "left") _ "of" { return "lhs" }
Right = ("to" / "into") _ "the" _ ("second blank" / "second field" /"last field" / "last blank"/ "righthand side" / "right") _ "of" { return "rhs" }
Top = ("at" / "to" / "into") _ "the" _ "top" _ "of" { return "top" }
Away = ("away")? _ "from" { return "away" }
Inside = ("inside" / "into") _ ("of")?  { return "inside" }
To = "to" { return "inside" }

Run = ("run the program" / "run it" / "run") { return {
    "action": "run"
} }

Undo = "undo" { return {
    "action": "undo"
} }
Redo = "redo" { return {
    "action": "redo"
} }

Separate = SeparateVerb _ block:BlockToken _ (("from"/"and") _ BlockToken)? { return {
    "action": "move",
    "block": block,
    "where": "away"
} }

SeparateVerb = "separate" / "disconnect" / "break apart"

_   = ' '*
