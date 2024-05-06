chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request && request.prompt) {
        const userInput = confirm('ExtenAlert wants to scan this URL. Do you want to continue?');
        sendResponse({ answer: userInput });
    }
});