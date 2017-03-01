___________________________________________________________________________________________________
# GUIDE FOR SPEECHGAMES
#### Updated 2/27/2017

<br/>
___________________________________________________________________________________________________
## ABOUT

##### This is a guide for completing the levels at http://aravart.github.io/speech-games.

##### Google Blockly is a system for learning how to program through the visualization of 'blocks' that represent common coding constructs. Speech Games is a series of levels that teach programming using Google Blockly with a twist: everything can be controlled by speech input.

<br/>
___________________________________________________________________________________________________
## QUICK BASICS

### The task of the user is to complete the levels through adding blocks onto the workspace and arranging them in a manner that  completes the task. Below is the basic syntax.

### Commands: attach, add, delete, change, run, separate <br/> <br/>

#### Easy command for each command type
> ##### "attach block 1 after block 2" <br/> "separate block 1" <br/> "add a move block" <br/> "delete block 1" <br/> "change the first field in block 1 to 100" <br/> "run the program" <br/>

##### \* note that when using speech, "please" before the command helps the speech-engine e.g.  "please add a move block"

<br/>
___________________________________________________________________________________________________
## IN DEPTH GUIDE

##### The grammar understands a little bit more than what’s above. Here are some more ways to specify each command. The portion inside (and not including) the quotation marks can be input. Note that there are sometimes a number of ways to get the same result but all such utterances have not been enumerated. Reference https://github.com/aravart/speech-games/blob/master/grammar/grammar.pegjs for grammar specifics. Additional comments are in parentheses after the quotation marks. Note that while the parser may understand some commands and report "input parsed successfully" some commands may not yet be compatible with the controller.

<br/>

### NOTATION
>#####  {type} means a block type listed in the toolbox on the left like "if," "repeat," etc. <br/> {id} means an ID such as "1," "2," etc. <br/> {value} means any one word (string ends at the first space after the string begins). <br/> {where} means before, after, or inside. <br/> {ordinal} means any of first, second, third, fourth <br/>
<br/>

### ATTACH: Attach a block <br/>
>##### "attach block {id} {where} block {id2}"  <br/>
##### Example:
>##### "attach block 1 after block 2"

<br/>

### SEPARATE: Segregate a block <br/>
>##### "separate block {id}" (separates block {id} from its predecessor and successor) <br/>
#### Example:
>##### "separate block 1"

<br/>

### ADD: Add a specific block type <br/>
>##### "add a {type} block" <br/> 
##### Example:
>##### "add a move block"

<br/>

### DELETE: Delete a block <br/>
>##### "delete block {id}" <br/>
##### Example:
>##### "delete block 1"

<br/>

### CHANGE: Change a block's properties (but not type) <br/>
>##### "change the {ordinal} field in block {id} to {value}" <br/>
##### Examples
>##### "change the first field in block 1 to 120" <br/>

 <br/>

### RUN: Run the program defined by the blocks in the canvas
>##### "run the program" <br/>

<br/> <br/>
___________________________________________________________________________________________________
## EXAMPLE OBJECTS

These are examples of the objects passed from the parser down to the interpreter for the most
complex (most specifications) command of each command type.
<br/>

### ATTACH: "attach block 1 after block 2": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "attach", <br/> &ensp;&ensp;&ensp; "block": 1, <br/> &ensp;&ensp;&ensp; "where": { <br/>  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp; "block": 2, <br/> &ensp;&ensp;&ensp;&ensp;&ensp;&ensp; "position": "after" <br/>  &ensp;&ensp;&ensp; }, <br/> }

<br/>

### SEPARATE: "separate block 1 from block 2": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "separate",  <br/> &ensp;&ensp;&ensp; "block": 1, <br/> }

<br/>

### ADD: "add a move block": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "add", <br/> &ensp;&ensp;&ensp; "type": "move" <br/>}

<br/>

### DELETE: "delete block 1": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "delete", <br/> &ensp;&ensp;&ensp; "block": 1 <br/> }

<br/>

### CHANGE: "change the first field in block 1 to 100": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "change", <br/> &ensp;&ensp;&ensp; "value": 100, <br/> &ensp;&ensp;&ensp; "block": 1, <br/> &ensp;&ensp;&ensp; "ordinal": "first" <br/> }

<br/>

### RUN: "run the program": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "run the program" <br/> }

<br/>

___________________________________________________________________________________________________
