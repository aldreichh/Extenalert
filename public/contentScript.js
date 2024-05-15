chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request && request.prompt) {
        const userInput = confirm('ExtenAlert wants to scan this URL. Do you want to continue?');
        sendResponse({ answer: userInput });
    }
});


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.threatLevel === "Low Threat Level") {
        const userResponse = confirm("Scan completed. This URL is considered a Low Threat Level and is deemed SAFE for browsing. Would you like to add this URL to the whitelisted URLs?");   
        sendResponse({ answer: userResponse }); 
    }
    else if (message.threatLevel === "Moderate Threat Level") {
        const userResponse = confirm("Scan completed. This URL is considered a Moderate Threat Level and is deemed UNSAFE for browsing. Do you want to add this URL to the blacklisted URLs and terminate this tab?");   
        sendResponse({ answer: userResponse }); 
    }
    else if(message.threatLevel === "High Threat Level") {
        const userResponse = confirm("Scan completed. This URL is considered a High Threat Level and is deemed UNSAFE for browsing. ExtenAlert recommends closing this tab immediately. Would you like to close this tab and add it to the blacklisted URLs?");   
        sendResponse({ answer: userResponse }); 
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.promptError === "An error has occured.") {
        const userResponse = confirm("An error has occured.");   
        sendResponse({ answer: userResponse }); 
    }
});