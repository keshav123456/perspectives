const getResponse = async (question) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await fetch("http://localhost:8080/?text=" + question, {
                method: "GET"
            })   
            resolve(res.text())
        } catch (e) {
            reject("Couldn't fetch")
        }
    })
}

chrome.action.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {type: "OPEN"})
});

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        const question = msg.question
        getResponse(question).then(async answer => {
            port.postMessage(answer)
        }).catch((e) => port.postMessage(e))
    })
})
