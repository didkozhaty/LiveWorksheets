type Answer = TextAnswer|ButtonAnswer
type TextAnswer = {
    type: "text",
    data: string
}
type ButtonAnswer = {
    type: "button",
    data: boolean
}

function putAnswers(answers?:string):void {
    let ans = (answers ?? "true|||false|||false|||true|||true|||false|||true|||false|||false|||true|||true|||false|||true|||false|||true|||false|||false|||true|||true|||false|||false|||true|||true|||false|||were you going|||Did you enjoy|||was always taking|||didn't have|||!was going|||became|||was working|||heard|||appeared|||threw|||false|||true|||true|||false|||true|||false|||true|||false|||true|||false|||true|||false|||true|||false|||true|||false|||false|||true|||true|||false|||true|||false|||false|||true|||true|||false|||true|||false|||true|||false|||true|||false|||had written|||had stayed|||had been waiting|||had been running|||had seen|||!had been knowing|||had been getting|||hadn't been having|||hadn't eaten|||had been listening|||true|||false|||false|||false|||false|||false|||true|||false|||false|||true|||false|||false|||false|||false|||false|||true|||false|||false|||false|||true|||true|||false|||false|||false|||false|||false|||false|||true|||false|||true|||false|||false").split('|||')
    let data: Answer[] = []
    let i = 0
    let fields = document.getElementById("worksheet-preview-elements")?.children
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
                    el.textContent = (data[i] as TextAnswer).data
            }
            i = i + 1
        }
    }
}