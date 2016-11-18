___________________________________________________________________________________________________

# GRAMMAR GUIDE FOR SPEECHBLOCKS
###### Updated 11/17/2016

<br/><br/>
___________________________________________________________________________________________________

## INTRO

This is a guide on the grammar for the SpeechBlocks interpreter. After reading this, the reader
should be able to manipulate Blockly with speech/text input.

<br/><br/>
___________________________________________________________________________________________________

## QUICK BASICS

### Commands: Move, add, remove, change, run, undo, redo, separate.

#### Easy sample command for each command type
   "move block 1 after block 2"
   "separate block 1 from block 2"
   "add a move block"
   "remove block 1"
   "change the property in block 1 to 100"
   "run"
   "undo"
   "redo"

* note that when using speech, "please" before the command helps the TTS engine e.g.
   "please add a move block"

<br/><br/>
___________________________________________________________________________________________________

## IN DEPTH GUIDE

The grammar understands a little bit more than what’s above. Here are some more ways to specify
each command. The portion inside (and not including) the quotation marks can be input. Note that
there are sometimes a number of ways to get the same result but all such utterances have not been
enumerated. Reference https://github.com/aravart/speech-games/blob/master/grammar/grammar.pegjs
for grammar specifics. Additional comments are in parentheses after the quotation marks. Note that
while the parser may understand some commands and report "input parsed successfully" some commands
may not yet be compatible with the controller. <br/><br/>

### Notation:
   {block type} means a block type like "if," "repeat," etc.
   {id} means an ID such as "1," "2," etc.
   {property} means any of "field," "blank," "property," "operation". Note that the grammar treats
      them as the same with no differentiation.
   {value} means any one word (string ends at the first space after the string begins).
   {where} means any of above, below, left, right, top, away, inside, and to
   {ordinal} means any of first, second, third, fourth, and last
   [block type] means that this command will only work (well) with the specified type(s)
   Command (synonyms): means the synonyms can be used interchangeable with Command <br/><br/>
   
### Move (attach): Move a block
   "move block {id} {where} from block {id}" (same as "separate block 1 from block 2")
   "move block {id} to the trash" (delete {id})
#### Example: 
   "move block 1 away from block 2" <br/><br/>
   
### Separate: Separate block(s)
   "separate block {id}" (separates block {id} from its predecessor and successor)
   "separate block {id} from block {id}"
   "separate block {id} and block {id}"
#### Example: 
   "separate block 1 from block 2"s <br/><br/>


### Add (insert, make): Add a specific block type
   "add a {block type} block"
   "add a {block type} block after block {id}"
   "add a {block type} block inside of block {id}"
   "add a [number] block to the right of block {id}" (used for comparison blocks)
   "add a [number] block to the left of block {id}"
   "add a [variable] block named {value}" (can only named variable blocks)
   "add a [variable] block named counter after block {id}"
#### Example: 
   "add a variable block named counter after block 1" <br/><br/>
   

### Remove (delete, erase): Remove block(s)
   "remove block {id}"
   "remove all" (deletes all blocks)
#### Example: 
   "remove block 1" <br/><br/>
   

### Change (set, modify)
Change a block's properties (but not type)
   "in block {id} change the {property} to {value}"
   "change the {property} to {value} in block {id}" (value ends when "in block" is encountered)
   "change the {property} in block {id} to {value}"
   "change in block {id} the {property} to {value}"
   The change commands can also optionally specify the property by order.
   "change the {ordinal} {property} in block {id} to {value}"
#### Examples
   "in block 1 change the operation to addition"
   "in block 1 change the first field to backwards" <br/><br/>


### Run
Run the program defined by the blocks in the canvas
  "run"
  "run the program"
  "run it" <br/><br/>


### Undo
Undoes the previous action. Repeatable.
  "undo" <br/><br/>


### Redo
Redoes the previous undo. Repeatable.
  "redo" <br/><br/>
  
<br/><br/>
___________________________________________________________________________________________________

## EXAMPLE OBJECTS

These are examples of the objects passed from the parser down to the interpreter for the most
complex (most specifications) command of each command type. When a property could have been
specified but wasn't (simple command given), the field in the parser's utterance object is just an
empty string. <br/><br/>

### Move:
"move block 1 after block 2":
{
   "action": "move",
   "block": 1,
   "where": {
      "block": 2,
      "position": "below"
   }
} <br/><br/>


### Separate:
"separate block 1 from block 2":
{
   "action": "move",
   "block": 1,
   "where": "away"
} <br/><br/>


### Add:
"add a variable named counter after block 1":
{
   "action": "add",
   "type": "variable",
   "where": {
      "block": 1,
      "position": "below"
   },
   "value": "counter"
} <br/><br/>


### Remove:
"remove block 1":
{
   "action": "delete",
   "block": 1
} <br/><br/>


### Change:
"change the property in block 1 to 100":
{
   "action": "modify",
   "property": "field",
   "value": 100,
   "block": 1,
   "ordinal": ""
} <br/><br/>


### Run:
"run":
{
   "action": "run"
} <br/><br/>


### Undo:
"undo":
{
   "action": "undo"
} <br/><br/>


### Redo:
"redo":
{
   "action": "redo"
} <br/><br/>
