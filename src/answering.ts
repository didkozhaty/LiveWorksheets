type Answer = TextAnswer|ButtonAnswer
type TextAnswer = {
    type: "text",
    data: string
}
type ButtonAnswer = {
    type: "button",
    data: boolean
}

const ignorableClasses = ["worksheet-blank-div", "worksheet-drop-div", "worksheet-audioplayer", "worksheet-listen-div", "worksheet-link-div", "worksheet-powerpoint-iframe", "worksheet-iframe"]
type pos = {
    x: number,
    y: number
};

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
    return element.getAttribute("spellcheck") == "false" && !element.hasAttribute("contenteditable") && !(element.classList.contains('!bg-green-120') || element.classList.contains('!bg-red-900'))
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
function isSelect(element: HTMLElement) {
    return element.firstChild?.nodeName === 'SELECT'
}
function isDraggable(element: HTMLElement) {
    let retme = false;
    const draggableClasses = ["worksheet-draggable-div"]
    draggableClasses.forEach((value) => {
        if(retme)
            return
        if(element.classList.contains(value))
            retme = true
    })
    return retme
}
function isJoin(element: HTMLElement) {
    let retme = false;
    const joinClasses = ["worksheet-join-div"]
    joinClasses.forEach((value) => {
        if(retme)
            return
        if(element.classList.contains(value))
            retme = true
    })
    return retme
}
function getPos(rect: DOMRect) {
    return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2} as pos
}
function getClickPos(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const borderWidth = Number.parseFloat(getComputedStyle(element).borderWidth.slice(0, -2)) * 2;
    const [height, width] = [rect.height, rect.width].map(el => (el - borderWidth) / 2)
    const [angle, length] = [Math.random() * 2 * Math.PI, Math.random()]
    let [x, y] = [Math.cos(angle), Math.sin(angle)]
    const max = Math.max(Math.abs(x), Math.abs(y))
    x /= max
    y /= max
    x *= length * width
    y *= length * height
    return {x: rect.x + rect.width / 2 + x, y: rect.y + rect.height / 2 + y} as pos
}
function isInRect(rect: DOMRect, position: pos) {
    return position.x >= rect.left && position.x <= rect.right &&
        position.y <= rect.bottom && position.y >= rect.top
}
let joins:[DOMRect, HTMLElement][] = []
function answerJoin(element: HTMLElement, offset: pos) {
    joins = [...document.querySelectorAll('.worksheet-join-div')].map(el => [el.getBoundingClientRect(), el as HTMLElement])
    const rect = element.getBoundingClientRect()
    const position = {x: offset.x + rect.x, y: offset.y + rect.y} as pos
    const target = joins.find((el) => isInRect(el[0], position))
    if(!target) {
        console.error(`There is no join element on ${position.x};${position.y}`)
        return
    }
    const thisPos = getClickPos(element)
    const targetPos = getClickPos(target[1])

    element.dispatchEvent(new MouseEvent('mousedown', {clientX: thisPos.x, clientY: thisPos.y, view: window}))
    window.dispatchEvent(new MouseEvent('mousemove', {clientX: targetPos.x, clientY: targetPos.y, view: window}))
    window.dispatchEvent(new MouseEvent('mouseup'))
}
function readJoin(element: HTMLElement) {
    const lines = [...document.querySelectorAll('line')].map((line): [pos, pos] => {
        const rect = line.getBoundingClientRect()
        const [x1, x2, y1, y2] = [line.getAttribute('x1'),line.getAttribute('x2'),line.getAttribute('y1'),line.getAttribute('y2')].map(el => Number.parseFloat(el ?? ''))
        const goesUp = (x1 > x2 && y1 > y2) || (x1 < x2 && y1 < y2)
        return [{x: goesUp? rect.x : (rect.x + rect.width), y: rect.y} as pos, {x: goesUp? (rect.x  + rect.width) : rect.x, y: rect.y + rect.height} as pos]
    })
    const rect = element.getBoundingClientRect()
    const line = lines.find((l) => isInRect(rect, l[0]) || isInRect(rect, l[1]))
    if(!line)
        return ''
    const point = line.find(l => !isInRect(rect, l))
    if(!point)
        throw `Something went wrong ${line}`
    const offset = {x: point.x - rect.x, y: point.y - rect.y} as pos
    return `${offset.x};${offset.y}`;
}

export function putAnswers(answers:string):void {
    let ans = answers.split('|||')
    let i = 0
    const doc = document.getElementById("worksheet-preview-elements")
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
            else if (isSelect(el))
            {
                (el.firstChild as HTMLSelectElement).selectedIndex = Number.parseInt(answer)
                el.firstChild?.dispatchEvent(new Event("change", {bubbles: true} ))
            }
            else if (isDraggable(el)) {
                el.dispatchEvent(new MouseEvent("mousedown", {bubbles: true} ))
                const [x, y] = answer.split(";")
                el.style.left = x
                el.style.top = y
                el.dispatchEvent(new MouseEvent("mouseup", {bubbles: true} ))
            }
            else if (isJoin(el)) {
                const dot = answer.split(';').map(el => Number.parseFloat(el))
                answerJoin(el, {x: dot[0], y: dot[1]} as pos)
            }
            else {
                console.error("Unknown type", el)
            }
        }
    }
}
export function getReadyAnswers(isRaw = false) {
    let doc = document.getElementById("worksheet-preview-elements")?.children
    const fields = []
    if(doc){
        for (let k of doc) {
            const el = k as HTMLElement
            if (isOpenAnswer(el)) {
                const text = k.textContent ?? '';
                if(isRaw)
                    fields.push(text)
                else {
                    const texts = text.split('/');
                    fields.push(texts[Math.floor(Math.random() * texts.length)]);
                }
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
            else if (isSelect(el))
            {
                fields.push((el.firstChild as HTMLSelectElement).selectedIndex)
            } else if (isDraggable(el)) {
                fields.push(`${el.style.left};${el.style.top}`)
            } else if (isJoin(el)) {
                fields.push(readJoin(el))
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
            else if (isSelect(el))
            {
                fields.push((el.firstChild as HTMLSelectElement).selectedIndex)
            }
            else if (isDraggable(el)) {
                fields.push(`${el.style.left};${el.style.top}`)
            } else if (isJoin(el)) {
                fields.push(readJoin(el))
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