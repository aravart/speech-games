___________________________________________________________________________________________________
# GUIDE FOR SPEECHGAMES
#### Updated 3/6/2017

<br/>
___________________________________________________________________________________________________
## ABOUT

##### This is a guide for completing the levels at http://aravart.github.io/speech-games.

##### Google Blockly is a system for learning how to program through the visualization of 'blocks' that represent common coding constructs. Speech Games is a series of levels that teach programming using Google Blockly with a twist: everything can be controlled by speech input.

<br/>
___________________________________________________________________________________________________
## QUICK BASICS

### The task of the user is to complete the levels through adding blocks onto the workspace and arranging them in a manner that  completes the task. Below is the basic syntax.

### Commands: get, connect, delete, change, run <br/> <br/>

#### Easy command for each command type
> ##### "please get a move block" <br/> "please connect block 1 under block 2"  <br/> "please delete block 1" <br/> "please change 90 in block 1  to 120" <br/> "please run the program" <br/>

<br/>
___________________________________________________________________________________________________
## IN DEPTH GUIDE

##### The grammar understands a little bit more than what’s above. Here are some more ways to specify each command. The portion inside (and not including) the quotation marks can be input. Additional comments are in parentheses after the quotation marks.

<br/>

### NOTATION
>#####  {type} means a block type listed in the toolbox on the left like "if," "repeat," etc. <br/> {id} means an ID such as "1," "2," etc. <br/> {value} means any one word or number (string ends at the first space after the string begins). <br/> {where} means under or inside.

<br/>

### GET: Get a specific block type <br/>
>##### "please get a {type} block" <br/> 
##### Example:
>##### "please get a move block"

<br/>

### CONNECT: Connect a block <br/>
>##### "please connect block {id} {where} block {id2}"  <br/>
##### Example:
>##### "please connect block 1 under block 2"
>##### "please connect block 1 inside of block 2"

<br/>

### DELETE: Delete a block <br/>
>##### "please delete block {id}" <br/>
##### Example:
>##### "please delete block 1"

<br/>

### CHANGE: Change a block's properties (but not type) <br/>
>##### "please change {value} in block {id} to {value}" <br/>
##### Examples
>##### "please change 90 in block 1 to 120" <br/>

 <br/>

### RUN: Run the program defined by the blocks in the canvas
>##### "please run the program" <br/>

<br/> <br/>
___________________________________________________________________________________________________
## EXAMPLE OBJECTS

These are examples of the objects passed from the parser down to the interpreter for the most
complex (most specifications) command of each command type.
<br/>

### CONNECT: "please connect block 1 under block 2": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "connect", <br/> &ensp;&ensp;&ensp; "block": 1, <br/> &ensp;&ensp;&ensp; "where": { <br/>  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp; "blockId": 2, <br/> &ensp;&ensp;&ensp;&ensp;&ensp;&ensp; "position": "under" <br/>  &ensp;&ensp;&ensp; }, <br/> }

<br/>

### GET: "please get a move block": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "get", <br/> &ensp;&ensp;&ensp; "type": "move" <br/>}

<br/>

### DELETE: "please delete block 1": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "delete", <br/> &ensp;&ensp;&ensp; "blockId": 1 <br/> }

<br/>

### CHANGE: "please change 90 in block 1 to 120": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "change", <br/> &ensp;&ensp;&ensp; "orig": 90, <br/> &ensp;&ensp;&ensp; "new": 120, <br/> &ensp;&ensp;&ensp; "block": 1 <br/> }

<br/>

### RUN: "please run the program": <br/>
>##### { <br/> &ensp;&ensp;&ensp; "action": "run" <br/> }

<br/>

___________________________________________________________________________________________________
