type Answer = TextAnswer|ButtonAnswer
type TextAnswer = {
    type: "text",
    data: string
}
type ButtonAnswer = {
    type: "button",
    data: boolean
}

export function putAnswers(answers?:string):void {
    let ans = (answers ?? "true|||false|||false|||true|||true|||false|||true|||false|||false|||true|||true|||false|||true|||false|||true|||false|||false|||true|||true|||false|||false|||true|||true|||false|||were you going|||Did you enjoy|||was always taking|||didn't have|||!was going|||became|||was working|||heard|||appeared|||threw|||false|||true|||true|||false|||true|||false|||true|||false|||true|||false|||true|||false|||true|||false|||true|||false|||false|||true|||true|||false|||true|||false|||false|||true|||true|||false|||true|||false|||true|||false|||true|||false|||had written|||had stayed|||had been waiting|||had been running|||had seen|||!had been knowing|||had been getting|||hadn't been having|||hadn't eaten|||had been listening|||true|||false|||false|||false|||false|||false|||true|||false|||false|||true|||false|||false|||false|||false|||false|||true|||false|||false|||false|||true|||true|||false|||false|||false|||false|||false|||false|||true|||false|||true|||false|||false").split('|||')
    let data: Answer[] = []
    let i = 0
    let doc = document.getElementById("worksheet-preview-elements")
    const fields = doc?.children
    for (let k of ans) {
        if (['true', 'false'].includes(k)) {
            data.push({type: "button", data: (k === 'true')})
        } else {
            data.push({type: "text", data: k})
        }
    }
    if (fields) {
        for (let field of fields) {
            const el = field as HTMLElement
            switch (data[i].type) {
                case "button":
                    if (data[i].data)
                        el.click()
                    break;
                case "text":
                    const dat = data[i] as TextAnswer
                    if(dat.data.startsWith('!'))
                    {
                        dat.data = dat.data.substring(1)
                        el.setAttribute("oldColor", el.style.background)
                        el.style.background = "red";
                        const onClick = (e:MouseEvent) => {
                            const elem = e.target as HTMLElement
                            elem.style.background = el.getAttribute("oldColor")??"white"
                            el.removeAttribute("oldColor")
                            elem.removeEventListener("click", onClick)
                        }
                        el.addEventListener("click", onClick)
                    }
                    el.textContent = (data[i] as TextAnswer).data
            }
            i = i + 1
        }
    }
}

export function getAnswers()
{
    let doc = document.getElementById("worksheet-preview-elements")?.children
    const fields = []
    if(doc){
        for (let k of doc) {
            if (k.hasAttribute("spellcheck")) {
                switch (k.getAttribute("class")) {
                    case "absolute text-center leading-none z-[4] bg-gray-505 text-[14px] text-blue-10 border border-gray-51 rounded-[4px] shadow-[0_0_8px] shadow-gray-60 !bg-green-120":
                        fields.push(k.textContent)
                        break
                    case "absolute text-center leading-none z-[4] bg-gray-505 text-[14px] text-blue-10 border border-gray-51 rounded-[4px] shadow-[0_0_8px] shadow-gray-60 !bg-red-900":
                        fields.push('!' + k.textContent)
                        break
                    default:
                        console.log("error", k)
                }
            } else {
                switch (k.getAttribute("class")) {
                    case "worksheet-select-div shadow-[0_0_3px_0] shadow-gray-610 bg-green-120":
                        fields.push(true)
                        break
                    case "worksheet-select-div !bg-red-900 !border-gray-605 rounded-[4px]":
                    case "worksheet-select-div":
                        fields.push(false)
                        break
                    default:
                        console.log("error", k)
                }
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

// export function getFuncs(element: HTMLElement):Map<string, any>|void {
//     const attributes = new Map<string, any>()
//     Object.getOwnPropertyNames(element).forEach((name) => {
//         attributes.set(name, element[name as keyof typeof element])
//     })
//     const funcs = new Map<string, any>()
//     attributes.forEach((value, key) => {
//         if (value.type === "void") {
//             funcs.set(key, value)
//         }
//     })
//     return attributes;
// }


export function hello() {
    return "hello"
}