//PHISHING URL SCANNING USING VIRUSTOTAL API
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.prompt) {
        const userInput = confirm('ExtenAlert! wants to scan this URL. Do you want to continue?');
        sendResponse({ answer: userInput });
    } else if (request.threatLevel) {
        let message = "";
        if (request.threatLevel === "Low Threat Level") {
            message = "Scan completed. This URL is considered a Low Threat Level and is deemed SAFE for browsing. Would you like to add this URL to the whitelisted URLs?";
        } else if (request.threatLevel === "Moderate Threat Level") {
            message = "Scan completed. This URL is considered a Moderate Threat Level and is deemed UNSAFE for browsing. Do you want to add this URL to the blacklisted URLs and terminate this tab?";
        } else if (request.threatLevel === "High Threat Level") {
            message = "Scan completed. This URL is considered a High Threat Level and is deemed UNSAFE for browsing. ExtenAlert! recommends closing this tab immediately. Would you like to close this tab and add it to the blacklisted URLs?";
        } else if (request.threatLevel === "Unrated Threat Level") {
            message = "Scan completed. This URL is unrated. It is recommended to exercise caution when visiting unrated URLs as they may pose potential risks. Would you like to close this tab and add the URL to the blacklisted URLs?";
        }
        if(request.threatLevel === "High Threat Level"){
            const userResponse = alert(message);
            sendResponse({ answer: userResponse });
        }
        else{
            const userResponse = confirm(message);
            sendResponse({ answer: userResponse });
        }
        
    } else if(request.isUnrated){
        const userResponse = confirm("This is an unrated website, Do you want to continue browsing?");
        sendResponse({ answer: userResponse });
    } else if(request.isNoThreatLevel){
        const userResponse = confirm("This website has been blocked, but no specific threat level was detected. It is recommended to close this website to ensure your safety. Do you want to continue?");
        sendResponse({ answer: userResponse });
    } else if (request.promptError === "An error has occurred.") {
        alert("An error has occurred.");
        sendResponse({ answer: true });
    } else if (request.threatDetected === "High") {
        alert("This URL has been blocked by ExtenAlert! High Threat Level");
        sendResponse({ answer: true });
    } else if(request.threatDetected === "Moderate"){
        const userResponse = confirm("This URL has been blocked by ExtenAlert! Moderate Threat Level. Do you still wanna browse this URL?");
        sendResponse({ answer: userResponse });
    } else if (request.confirmation === "success") {
        alert("Successfully added!");
        sendResponse({ answer: true });
    } else if (request.isDriveByDownload === "isDriveByDownload") {
        alert("Successfully added!");
        sendResponse({ answer: true });
    } 
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.isDriveByDownload === true) {
        alert("Drive-by Download has been detected!");
        sendResponse({ answer: true });
    } 
});

// contentscript.js
document.addEventListener('click', (event) => {
    let element = event.target;

    // Traverse up the DOM tree to find the closest anchor element if the clicked element is nested inside
    while (element && element.tagName !== 'A') {
        element = element.parentElement;
    }

    // If an anchor element with an href attribute is found, send the URL to the background script
    if (element && element.href) {
        chrome.runtime.sendMessage({ url: element.href, userInitiated: true }, (response) => {
            console.log(response.status);
        });
    }
});

