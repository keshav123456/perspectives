const returnSelection = () => {
    return new Promise((resolve, reject) => {
        if (window.getSelection) {
            resolve(window.getSelection().toString())
        } else if (document.getSelection) {
            resolve(document.getSelection().toString())
        } else if (document.selection) {
            resolve(document.selection.createRange().text.toString())
        } else reject();
    })
}

chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    const { type } = request
    if (type === "LOAD") {
        try {
            const selection = await returnSelection()
            response(selection)
        } catch (e) {
            response()
        }
    }
    if (type == "OPEN"){
        toggle();
    }
})

var iframe = document.createElement('iframe'); 
iframe.style.background = "green";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.src = chrome.runtime.getURL("popup.html")

document.body.appendChild(iframe);

function toggle(){
    if(iframe.style.width == "0px"){
        iframe.style.width="22.5%";
    }
    else{
        iframe.style.width="0px";
    }
}
