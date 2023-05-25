document.addEventListener("DOMContentLoaded", async () => {

    var myButton = document.getElementById("refresh");
        myButton.addEventListener("click", function() {
            getSelectedText()
    });

    const getActiveTab = async () => {
        const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
        })
        return tabs[0]
    }

    const showPopup = async (answer) => {
        try {
            let res = await answer
            parsed_res = JSON.parse(res)
            document.getElementById('output').style.opacity = 1
            let list_of_res = await generateHtml(parsed_res) 
            document.getElementById('output').innerHTML = ""
            document.getElementById('output').appendChild(list_of_res) 
            return;
        } catch (e) {
            document.getElementById('output').style.opacity = 1
            document.getElementById('output').innerHTML = e
        }
    }

    const getData = async (selection) => {
        if (!selection.length == 0) {
            document.getElementById('input').style.opacity = 1
            document.getElementById('input').innerHTML = selection
            document.getElementById('output').style.opacity = 0.8
            document.getElementById('output').innerHTML = "  Loading..."
            const port = chrome.runtime.connect();
            port.postMessage({question: selection})
            port.onMessage.addListener((msg) => showPopup(msg))
        } else {
            document.getElementById('input').style.opacity = 0.8
            document.getElementById('input').innerHTML = "You have to first select some text"
        }
    }

    const getSelectedText = async () => {
        const activeTab = await getActiveTab()
        chrome.tabs.sendMessage(activeTab.id, {type: "LOAD"}, getData)
    }

    const generateHtml = async (articles) => {
        
        var articleList = document.createElement("div");
        articleList.classList.add("news-list")

        var inner_div = document.createElement("ul")
        for (var i = 0; i < articles.length; i++) {
            // Create a new list item element
            var listItem = document.createElement("li");
      
            // Create a new heading element with the article title
            var heading = document.createElement("h4");
            heading.classList.add("heading")
            heading.textContent = articles[i].title;
            heading.href=articles[i].url
      
            // add publisher and date to a row
            var row1 = document.createElement("div")
            row1.classList.add("container")

            var publisher = document.createElement("p");
            publisher.textContent = "By: "+articles[i].publisher;

            var date = document.createElement("p")
            date.classList.add("date")
            date.innerHTML = articles[i]. date.substring(0, 17);
            
            row1.appendChild(publisher)
            row1.appendChild(date)

            // add the polarity/sentiment + political leanings 
            var row2 = document.createElement("div")
            row2.classList.add("container")

            var polarity_element = document.createElement("p");
            polarity = "Polarity: Neutral "
            if (articles[i].polarity > 0) {
                polarity = "Polarity: Positive "
            } else if (articles[i].polarity < 0){
                polarity = "Polarity: Negative "
            }

            polarity_element.textContent = polarity + articles[i].polarity.toFixed(2);

            var subjectivity = document.createElement("p")
            subjectivity.innerHTML = "Subjectivity: " + articles[i].subjectivity.toFixed(2)
            
            row2.appendChild(polarity_element)
            row2.appendChild(subjectivity)

            // add summary
            var summary = document.createElement("button")
            summary.classList.add("collapsible")
            summary.textContent = "Summary"
            summary.id = "summary_"+String(i)

            var content = document.createElement("div");
            content.classList.add("content")
            content.id = "content_"+String(i)

            var sent = document.createElement("p")
            sent.textContent = articles[i].summary
            content.appendChild(sent)

            summary.addEventListener("click", function() {
                this.classList.toggle("active");
                var div_id = this.id.split("_")[1]
                var spec_content = document.getElementById("content_"+div_id)
                if (spec_content.style.display === "block") {
                    spec_content.style.display = "none";
                } else {
                    spec_content.style.display = "block";
                }
              });

            // Add the heading, and all the details to the list
            listItem.appendChild(heading);
            listItem.appendChild(row1)
            listItem.appendChild(row2)
            listItem.appendChild(summary)
            listItem.appendChild(content)

            // Add the list item to the list
            inner_div.appendChild(listItem);
          }
          articleList.appendChild(inner_div)
        return articleList
    }
})
