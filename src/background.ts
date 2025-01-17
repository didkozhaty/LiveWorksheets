chrome.action.onClicked.addListener((tab) => {
    if(tab.id)
    {
        chrome.scripting.executeScript(
            {
                target: {tabId: tab.id},
                func: () => {console.log("Loaded")},
            }
        )
    }
})