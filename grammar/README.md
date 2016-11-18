___________________________________________________________________________________________________
# GRAMMAR GUIDE FOR SPEECHBLOCKS
#### Updated 11/17/2016

<br/>
___________________________________________________________________________________________________
## INTRO

##### This is a guide on the grammar for the SpeechBlocks interpreter. After reading this, the reader should be able to manipulate Blockly with speech/text input.

<br/>
___________________________________________________________________________________________________
## QUICK BASICS

### Commands: Move, add, remove, change, run, undo, redo, separate. <br/> <br/>

#### Easy sample command for each command type
> ##### "move block 1 after block 2" <br/> "separate block 1 from block 2" <br/> "add a move block" <br/> "remove block 1" <br/> "change the property in block 1 to 100" <br/> "run" <br/> "undo" <br/> "redo" <br/>

##### \* note that when using speech, "please" before the command helps the TTS engine e.g.  "please add a move block"

<br/>
___________________________________________________________________________________________________
## IN DEPTH GUIDE

##### The grammar understands a little bit more than what’s above. Here are some more ways to specify each command. The portion inside (and not including) the quotation marks can be input. Note that there are sometimes a number of ways to get the same result but all such utterances have not been enumerated. Reference https://github.com/aravart/speech-games/blob/master/grammar/grammar.pegjs for grammar specifics. Additional comments are in parentheses after the quotation marks. Note that while the parser may understand some commands and report "input parsed successfully" some commands may not yet be compatible with the controller. <br/>

### NOTATION
>#####  {block type} means a block type like "if," "repeat," etc. <br/> {id} means an ID such as "1," "2," etc. <br/> {property} means any of "field," "blank," "property," "operation". Note that the grammar treats them as the same with no differentiation. <br/> {value} means any one word (string ends at the first space after the string begins). <br/> {where} means any of above, below, left, right, top, away, inside, and to <br/> {ordinal} means any of first, second, third, fourth, and last <br/> [block type] means that this command will only work (well) with the specified type(s) <br/> Command (synonyms): means the synonyms can be used interchangeable with Command <br/> <br/> <br/>

### MOVE (ATTACH)
#### Move a block <br/>
>##### "move block {id} {where} from block {id}" (same as "separate block 1 from block 2") <br/> "move block {id} to the trash" (delete {id}) <br/>
##### Example:
>##### "move block 1 away from block 2" <br/> <br/>

### SEPARATE
#### Separate block(s) <br/>
>##### "separate block {id}" (separates block {id} from its predecessor and successor) <br/> "separate block {id} from block {id}" <br/> "separate block {id} and block {id}" <br/>
#### Example:
>##### "separate block 1 from block 2" <br/> <br/>

### ADD (INSERT, MAKE)
#### Add a specific block type <br/>
>##### "add a {block type} block" <br/> "add a {block type} block after block {id}" <br/> "add a {block type} block inside of block {id}" <br/> "add a [number] block to the right of block {id}" (used for comparison blocks) <br/> "add a [number] block to the left of block {id}" <br/> "add a [variable] block named {value}" (can only named variable blocks) <br/> "add a [variable] block named counter after block {id}" <br/>
##### Example:
>##### "add a variable block named counter after block 1" <br/> <br/>

### REMOVE (DELETE, ERASE)
#### Remove block(s) <br/>
>##### "remove block {id}" <br/> "remove all" (deletes all blocks) <br/>
##### Example:
>##### "remove block 1" <br/> <br/>

### CHANGE (SET, MODIFY)
#### Change a block's properties (but not type) <br/>
>##### "in block {id} change the {property} to {value}" <br/> "change the {property} to {value} in block {id}" (value ends when "in block" is encountered) <br/> "change the {property} in block {id} to {value}" <br/> "change in block {id} the {property} to {value}" <br/> The change commands can also optionally specify the property by order. <br/> "change the {ordinal} {property} in block {id} to {value}" <br/>
##### Examples
>##### "in block 1 change the operation to addition" <br/> "in block 1 change the first field to backwards" <br/> <br/>

### RUN
#### Run the program defined by the blocks in the canvas
>##### "run" <br/> "run the program" <br/> "run it" <br/> <br/>

### UNDO
#### Undoes the previous action. Repeatable.
>##### "undo" <br/> <br/>

### REDO
#### Redoes the previous undo. Repeatable.
>##### "redo" <br/> <br/>

<br/>
___________________________________________________________________________________________________
## EXAMPLE OBJECTS

These are examples of the objects passed from the parser down to the interpreter for the most
complex (most specifications) command of each command type. When a property could have been
specified but wasn't (simple command given), the field in the parser's utterance object is just an
empty string.
<br/>

### MOVE
#### "move block 1 after block 2": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "move", <br/> &ensp;&ensp;&ensp; "block": 1, <br/> &ensp;&ensp;&ensp; "where": { <br/>  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp; "block": 2, <br/> &ensp;&ensp;&ensp;&ensp;&ensp;&ensp; "position": "below" <br/>  &ensp;&ensp;&ensp; }, <br/> } <br/> <br/>

### SEPARATE
#### "separate block 1 from block 2": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "move",  <br/> &ensp;&ensp;&ensp; "block": 1, <br/> &ensp;&ensp;&ensp; "where": "away" <br/> } <br/> <br/>

### ADD
#### "add a variable named counter after block 1": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "add", <br/> &ensp;&ensp;&ensp; "type": "variable", <br/> &ensp;&ensp;&ensp; "where": { <br/> &ensp;&ensp;&ensp;&ensp;&ensp;&ensp; "block": 1, <br/> &ensp;&ensp;&ensp;&ensp;&ensp;&ensp; "position": "below" <br/> &ensp;&ensp;&ensp; }, <br/> &ensp;&ensp;&ensp; "value": "counter" <br/> &ensp;&ensp;&ensp; <br/> <br/>

### REMOVE
#### "remove block 1": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "delete", <br/> &ensp;&ensp;&ensp; "block": 1 <br/> } <br/>

### CHANGE
#### "change the property in block 1 to 100": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "modify", <br/> &ensp;&ensp;&ensp; "property": "field", <br/> &ensp;&ensp;&ensp; "value": 100, <br/> &ensp;&ensp;&ensp; "block": 1, <br/> &ensp;&ensp;&ensp; "ordinal": "" <br/> } <br/>

### RUN
#### "run": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "run" <br/> } <br/>

### UNDO
#### "undo": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "undo" <br/> } <br/>

### REDO
#### "redo": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "redo" <br/> } <br/>
___________________________________________________________________________________________________
