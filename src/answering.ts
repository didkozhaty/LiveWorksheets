type Answer = TextAnswer|ButtonAnswer
type TextAnswer = {
    type: "text",
    data: string
}
type ButtonAnswer = {
    type: "button",
    data: boolean
}

const ignorableClasses = ["worksheet-blank-div", "worksheet-audioplayer", "worksheet-listen-div", "worksheet-link-div", "worksheet-powerpoint-iframe", "worksheet-iframe"]

function isIgnorableClass(element: HTMLElement) {
    let found = false
    try {
        ignorableClasses.forEach((value) => {
            if(found)
                return
            if(element.classList.contains(value))
                found = true
        })
    }
    catch(e) {
        console.error(e, element)
    }
    return found
}
function isInedibleText(element: HTMLElement) {
    return element.getAttribute("spellcheck") == "false" && !element.hasAttribute("contenteditable")
}
function isBoxBeforeMicrofone(element: HTMLElement) {
    const parentChildren = Array.from(element.parentElement?.children ?? []);
    const index = parentChildren.indexOf(element) + 1;
    return parentChildren[index] && parentChildren[index].classList.contains("worksheet-microphone-div");
}
export function isIgnorable(element: HTMLElement): boolean {
    return isIgnorableClass(element) || isInedibleText(element) || isBoxBeforeMicrofone(element);
}

function isOpenAnswer(element: HTMLElement): boolean {
    return element.hasAttribute("spellcheck");
}
function isButton(element: HTMLElement): boolean {
    let retme = false;
    const buttonClasses = ["worksheet-tickbox", "worksheet-select-div"]
    buttonClasses.forEach((value) => {
        if(retme)
            return
        if(element.classList.contains(value))
            retme = true
    })
    return retme
}

export function putAnswers(answers:string):void {
    let ans = answers.split('|||')
    let i = 0
    let doc = document.getElementById("worksheet-preview-elements")
    const fields = doc?.children
    if (fields) {
        for (let field of fields) {
            const el = field as HTMLElement
            let answer = ans[i]
            i = i + 1
            if (isIgnorable(el)) {
                continue
            }
            if (isOpenAnswer(el)) {
                if(answer.startsWith('!')) {
                    el.setAttribute("oldColor", el.style.background)
                    const onClick = (e:MouseEvent) => {
                        const elem = e.target as HTMLElement
                        elem.style.background = el.getAttribute("oldColor")??"white"
                        el.removeAttribute("oldColor")
                        elem.removeEventListener("click", onClick)
                    }
                    answer = answer.substring(1)
                    el.style.background = "red";
                    el.addEventListener("click", onClick)
                }
                el.textContent = answer
                el.dispatchEvent(new Event("blur", {bubbles: true}))
            }
            else if (isButton(el))
            {
                if (answer === 'true')
                    el.click()
            }
            else {
                console.error("Unknown type", el)
            }
        }
    }
}
export function getReadyAnswers() {
    let doc = document.getElementById("worksheet-preview-elements")?.children
    const fields = []
    if(doc){
        for (let k of doc) {
            const el = k as HTMLElement
            if (isOpenAnswer(el)) {
                fields.push(k.textContent)
            }
            else if (isIgnorable(el)){
                fields.push('')
            }
            else if (isButton(el))
            {
                if(el.classList.contains("worksheet-tickbox-correct") || el.classList.contains("bg-green-120"))
                    fields.push("true")
                else
                    fields.push("false")
            }
            else {
                fields.push('')
                console.error("Unknown type", el)
            }
        }
    }
    return fields.join('|||');
}
export function getAnswers()
{
    let doc = document.getElementById("worksheet-preview-elements")?.children
    const fields = []
    if(doc){
        for (let k of doc) {
            const el = k as HTMLElement

            if (isIgnorable(el)){
                fields.push('')
            }
            else if (isOpenAnswer(el)) {
                fields.push((el.classList.contains("!bg-red-900") ? '!' : '') + el.textContent)
            }
            else if (isButton(el))
            {
                if(el.classList.contains("worksheet-tickbox-correct") || el.classList.contains("bg-green-120"))
                    fields.push("true")
                else
                    fields.push("false")
            }
            else {
                fields.push('')
                console.error("Unknown type", el)
            }
        }
    }
    return fields.join('|||');
}

export function clickAll()
{
    const buttons = document.querySelectorAll(`[class=\"worksheet-select-div worksheet-clickable-element\"]`)
    buttons.forEach(button => {
        (button as HTMLElement).click()
    })
}

export function hello() {
    return "hello"
}

export function showAnswers() {
    // @ts-ignore
    jQuery("#worksheet-preview").worksheetPreview("validation",{clicked:!1,showAnswers:!0,showRightAnswers:!0});
}
export function showInvisibles(color = "black") {
    const invisibles = document.querySelectorAll(`.worksheet-draggable-div,.worksheet-drop-div,.worksheet-join-div,.worksheet-join-div-cursor, .worksheet-listen-div`)
    invisibles.forEach((element) => {
        (element as HTMLElement).style.border = "solid black 5px"
    })
}