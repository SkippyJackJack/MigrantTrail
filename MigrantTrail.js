function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";";
}

//global UI variables
var globalCanvas;
var globalButton1;
var globalButton2;
var globalButton3;
var globalButton4;
var globalTextEntry;
//global game variables
var globalStoryState;
var globalPlayerName;
var globalPlayerProfession;
var forestDecisionState;
//debug variables
//NOTE: ALL GLOBAL VARIABLES MUST START WITH "global" OR THE WILL NOT BE EDITABLE BY THE DEBUG TEXT INPUT FEATURE
var globalDebugTextInput;
var globalDebugSendCommand;
var globalDebugTextOutput;
//bind the user interface elements to global variables and start a new game
function initializeGame(canvas, button1, button2, button3, button4, textEntry) {
    globalCanvas = canvas;
    globalButton1 = button1;
    globalButton2 = button2;
    globalButton3 = button3;
    globalButton4 = button4;
    globalTextEntry = textEntry;
    
    globalStoryState = getCookie("storyState");
    globalPlayerName = getCookie("playerName");
    forestDecisionState = getCookie("forestDecision");

    newGame();
}
//link to the debug UI controls
function initializeDebug(debugTextInput, debugSendCommand, debugTextOutput) {
    globalDebugTextInput = debugTextInput;
    globalDebugSendCommand = debugSendCommand;
    globalDebugTextOutput = debugTextOutput;
    debugLog("Debug Log:");
}
//parse the text in the debug text input box to assign global variable values and/or trigger game states
//One variable assign per line. Assigning globalStoryState also triggers a reset of the story state
//
// for example:
//  globalPlayerName = "David"
//  globalStoryState = "EnterName"
// would set the two global variables and reset the story state by calling advanceStory();
function debugSendCommand() {
    var cmd = globalDebugTextInput.value;
    var setStoryState = false;
    do {
        //split the debug text into single lines
        var indexOfNewLine = cmd.indexOf("\n");
        //include the last line without a newline character
        if (indexOfNewLine < 0) { indexOfNewLine = cmd.length; }
        var line = cmd.substr(0, indexOfNewLine);
        //check to see if the line follows the format "variable = value"
        if (line.includes("=")) {
            //pull the variable name and value
            var variable = line.substr(0, line.indexOf("="));
            //do not allow any non-alphanumeric characters in the variable name;
            variable = variable.replace(/\W|_/g, "");
            var value = line.substr(line.indexOf("=") + 1, line.length);
            value = value.trim();
            //only allow editing of variables that are global and start with the keyword "global"
            if (variable.substring(0, 6) == "global") {
                try {
                    //set variable = value
                    eval(variable + " = " + value);
                    //if the variable was globalStoryState, also flag a reset of the story later
                    if (variable == "globalStoryState") { setStoryState = true; }
                    debugLog("Set " + variable + " to " + value);
                } catch (e) {
                    debugLog("Failed to evaluate: " + variable + " = " + value + "\nIs " + variable + " a global variable?");
                    debugLog(e);
                }
            }
        }
        cmd = cmd.substr(indexOfNewLine + 1, cmd.length);
    } while (cmd.length > 0);
    //if globalStoryState was changed, reset the story
    if (setStoryState) {
        advanceStory();
    }
}
//add "text" to the debugTextOutput box
function debugLog(text) {
    globalDebugTextOutput.value = globalDebugTextOutput.value + "\n" + text;
}
//reset the UI elements and reset the story
function newGame() {
    closeUI();
    if (globalStoryState == "") {
        globalStoryState = "Intro";
    }
    advanceStory();
}
//draw an image in the upper two thirds of the canvas.
//the image name is passed as a parameter and must be type
//png and have size 800 x 300 pixels
function drawImage(imageName) {
    try {
        var base_image = new Image();
        base_image.src = 'img/' + imageName + '.png';
        base_image.onload = function () {
            var ctx = globalCanvas.getContext("2d");
            ctx.drawImage(base_image, 0, 0);
        }
    } catch (e) {
        debugLog("Failed to load : img/" + imageName + ".png does it exist?");
        debugLog(e);
    }
}
//draw a text box in the lower thrid of the canvas
//pass the text to draw as a parameter and then parse that
//test into lines
function drawText(text) {
    var ctx = globalCanvas.getContext("2d");
    //fill the space with a white rectangle to overwrite previous text
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 300, 800, 500);
    //draw two black border rectangles
    ctx.rect(0, 300, 800, 500);
    ctx.stroke();
    ctx.rect(5, 305, 790, 190);
    ctx.stroke();
    //set the text font
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";
    //all text must terminate in a space character
    text = text + " ";
    //print five lines
    for (var i = 0; i <= 5; i++) {
        //create a variable for each line
        var textLine = "";
        //fill that line with words until it reaches full length or all the text is used
        while (textLine.length < 85 && text.length > 1) {
            //find the next word
            var indexOfSpace = text.indexOf(" ");
            if (indexOfSpace >= 0) {
                //get the next word
                var nextWord = text.substr(0, indexOfSpace) + " ";
                //if the next word would not cause overflow to the next line, append it
                if (textLine.length + nextWord.length < 85) {
                    textLine = textLine + nextWord;
                    text = text.substr(indexOfSpace + 1, text.length);
                }
                //otherwise, skip the next word for now, it will go on the next line
                else {
                    break;
                }
            }
        }
        //var textLine = text.substr(0, 40);
        //text = text.substr(40, text.length);
        ctx.fillText(textLine, 30, 335 + 30 * i);
    }
    //if there is still text left, prompt a continue
    debugLog(text);
}
//make the text box visible. optional parameter to enter
//default text into the textbox
function acceptText(text) {
    if (typeof text === 'undefined') { text = ""; }
    globalTextEntry.style.display = "initial";
    globalTextEntry.value = text;
}
//make button number buttonNumvber visible. 
//parameter text will change the text of the button
function setButton(buttonNumber, text) {
    if (buttonNumber == 1) {
        globalButton1.style.display = "initial";
        globalButton1.value = text;
    } else if (buttonNumber == 2) {
        globalButton2.style.display = "initial";
        globalButton2.value = text;
    } else if (buttonNumber == 3) {
        globalButton3.style.display = "initial";
        globalButton3.value = text;
    } else if (buttonNumber == 4) {
        globalButton4.style.display = "initial";
        globalButton4.value = text;
    }
}
//fires when one of the User Interface buttons is clicked
//pass the button number that was clicked to the story
//and reset the UI
function captureButton(buttonNumber) {
    closeUI();
    advanceStory(buttonNumber);
}
//reset the UI. Make all UI elements disabled
function closeUI() {
    globalButton1.style.display = "none";
    globalButton2.style.display = "none";
    globalButton3.style.display = "none";
    globalButton4.style.display = "none";
    globalTextEntry.style.display = "none";
}
//the game story
//
//optional parameter buttonNumber is the UI button that was clicked
//
//global variable globalStoryState keeps track of which step in the story the user has reached
//in each story stage, the image and/or text have to be reset with drawImage and drawText
//additionally, the UI needs to be set up as it closes after every user input.
var i = 0;
var txt = 'Your life is about to change forever. But first, who are you? Enter your name to start your Journey! In Migrant Trail, you take on the role and hopefully, gain some insight into the hardships of those fleeing Myanmar due to the Rohingya Crisis.';
var speed = 1;
var tempText = "";
var button1TxtActual = "";
var button2TxtActual = "";
var button3TxtActual = "";
var button4TxtActual = "";
var acceptTextTrue = false;

function typeWriter() {
    if (i < txt.length) {
        tempText += txt.charAt(i);
        drawText(tempText)
        i++;
        setTimeout(typeWriter, speed);
    } else {
        if (button1TxtActual != "") {
            setButton(1, button1TxtActual);
        }
        if (button2TxtActual != "") {
            setButton(2, button2TxtActual);
        }
        if (button3TxtActual != "") {
            setButton(3, button3TxtActual);
        }
        if (button4TxtActual != "") {
            setButton(4, button4TxtActual);
        }
        if (acceptTextTrue) {
            acceptText();
        }
    }
}

function setWriter(specialTxt, button1Txt, button2Txt, button3Txt, button4Txt, acceptTextBool) {
    txt = specialTxt;
    tempText = "";
    i = 0;
    button1TxtActual = "";
    button2TxtActual = "";
    button3TxtActual = "";
    button4TxtActual = "";
    button1TxtActual = button1Txt;
    button2TxtActual = button2Txt;
    button3TxtActual = button3Txt;
    button4TxtActual = button4Txt;
    acceptTextTrue = acceptTextBool
    typeWriter();
}

function advanceStory(buttonNumber) {
    //the buttonNumber variable is an optional parameter, so set it to zero if it is unused
    if (typeof buttonNumber === 'undefined') { buttonNumber = 0; }
    if (globalStoryState == "Intro") {
        drawImage("homescreen");
        setWriter("Your life is about to change forever. But first, who are you? Enter your name to start your Journey! In Migrant Trail, you take on the role and hopefully, gain some insight into the hardships of those fleeing Myanmar due to the Rohingya Crisis.", "Enter your name", "", "", "", true);
        globalStoryState = "EnterName";
        setCookie("storyState", globalStoryState, 365);
    } else if (globalStoryState == "EnterName") {
        if (globalTextEntry.value.length > 0) {
            globalPlayerName = globalTextEntry.value;
            setCookie("playerName", globalPlayerName, 365);
            globalStoryState = "SceneAfterIntro";
            setCookie("storyState", globalStoryState, 365);
            advanceStory();
        } else {
            globalStoryState = "Intro";
            setCookie("storyState", globalStoryState, 365);
            advanceStory();
        }
    } else if (globalStoryState == "SceneAfterIntro") {
        //Dhevin: Fix this immage
        drawImage("Raqqa");
        setWriter("You've been living in a village near Kyauktaw, a small town in Northern Rakhine state, in Myanmar, for the past 24 years." + globalPlayerName + ", You've just found out from someone nearby that the military's coming to your village, which is one with a large Rohingya population.",
            "I know they can immediately tell I'm Rohingya if they see me, but I will hide in my house and hope they pass by",
            "I've heard and seen the horrible things they do, I'm scared. I'm going to pack my most essential belongings and run to the forest. The Military won't look there.",
            "I have a bad feeling about this. I don't think I'll be able to return, I'm going to pack my important belongings, take that car outside my house, and leave.",
            "We might not be citizens, but all the military wants to do is make sure we aren't part of the ARSA, a Rohingyan paramilitary group. Once I tell them I have nothing to do with that I'll be fine ",
            false)
        if (buttonNumber == 2) {
            globalStoryState = "ForestDecision";
            setCookie("storyState", globalStoryState, 365);
        } else if (buttonNumber == 1 || buttonNumber == 3 || buttonNumber == 4) {
            globalStoryState = "EndGame";
            setCookie("storyState", globalStoryState, 365);
            buttonNumber = 0;
        }
    } else if (globalStoryState == "ForestDecision") {
        drawText("You've succesfully ran away to the forest. The military won't find you here, but you can still see your village through the trees. A while later, you see military vehicles entering your village.")
        setButton(1, "I've planned this situation with my family. They might've been out but they know that they need to go hide in the woods, I'll look for them.");
        setButton(2, "I haven't got a family, but there must be some other people from the village who escape. I'll wait for them, we have a larger chance of survival if we stick together for the long journey ahead");
        setButton(3, "The military's just here to look for terrorists, they'll leave when they realize no one in our village is one. I'll just wait for them to leave and then head back.");
        setButton(4, "I can't take the risk of military finding me. I have everything I need to survive for now with me. I'm going to keep walking and find a safe place.");
        if (buttonNumber == 4) {
            //to store decision
            forestDecisionState = "KeepWalking";
            setCookie("forestDecision", forestDecisionState, 365);
            globalStoryState = "ChooseCareer";
            setCookie("storyState", globalStoryState, 365);
        }
    } else if (globalStoryState == "ChooseCareer") {
        if (forestDecisionState == "KeepWalking") {
            drawText("As you prepare to walk away from the only life you've known, having waited to make sure you aren't making a mistake by leaving, you watch your home be burned to the ground. You remember the life you've lived there")
            setButton(1, "Growing up working on a small farm, I've spent all your time in the village, getting to know all of the neighbors and almost everyone in the small village. I'm most probably never going to see any of them again, if any of them were even lucky enough to escape. The physical strenght and knowledge of the countryside you've gained from farming will help in your journey")
            setButton(2, "Having spent my childhood walking to the nearby town of Kyauktauw to complete my highschool education, I now spend my time teaching the younger children in the village to try and make up for the education they're denied. I wanted to make sure they all have basic skills like reading and writing to make sure they can make a life for themselves when they leave the country.")
            setButton(3, "I've been working as an assistant at the local clinic, while I couldn't become a doctor since we can't go to university, I've been travelling to Kyautaw everyday for the past 4 years, learning from a doctor there. I've helped many people both from my village and in the town with sickness, injury, and old age.")
            setButton(4, "I run a small shop in my village that sells groceries, stationary, some medicine, and cigarettes and coffee. It's where everyone goes after lunch, before they get back to work. I couldn't get anything from there; and have lost all the money in there.")
        }
    } else if (globalStoryState == "EndGame") {
        drawText("After a long journey you feel tired and lay down rest. You feel you tried your best. GAME OVER")
        setButton(1, "Try Again")
        if (buttonNumber == 1) {
            globalStoryState = "Intro";
            setCookie("storyState", globalStoryState, 365);
            newGame();
        }
    }
}