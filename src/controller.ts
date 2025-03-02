import * as answers from "./answering";


console.log("answers");
(window as any).hello = answers.hello;
(window as any).answers = answers;
(window as any).help = (command = '') => {
    if (command === '')
        console.log("All commands accessible through answers. syntax. Write a command name to get help");
    else if (command === 'getAnswers')
        console.log("This command returns a string with answers separated by |||. Use it when you did work by yourself and checked it already")
    else if (command === 'getReadyAnswers')
        console.log("This command returns a string with answers separated by |||. Use it when you use showAnswers command")
    else if (command === 'putAnswers')
        console.log("Puts text and button answers from string returned by getAnswers")
    else if (command === 'clickAll')
        console.log("Just clicks all the elements")
    else if (command === 'showAnswers')
        console.log("Shows all answers, but you can't submit it on this tab")
    else if (command === 'showInvisibles')
        console.log("Adds borders to object rendered as part of the image or just invisible. Useful in cases when they've been place in dumb places so you can't find it")
}
