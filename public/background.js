console.log('Background script executing...');

let indexTabId = null;

chrome.webNavigation.onCompleted.addListener(function(details) {
    chrome.storage.local.get('URL', function(result) {
        const storedData = result.URL || []; 
        console.log(storedData);

        const currentUrl = details.url;
        if (!currentUrl || currentUrl.match(/^chrome:\/\//) || currentUrl.startsWith("about:blank")) {
            return;
        }
        
        for (let i = 0; i < storedData.length; i++) {
            if(currentUrl === storedData[i].url) {
                console.log(storedData[i].url);
                return;
            }
        }

        // If no match is found, show the prompt
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {prompt: true}, function(response) {
                if (response && response.answer !== undefined) {
                    chrome.storage.local.set({ 'userAnswer': response.answer });
                    console.log('User answer:', response.answer);
                }
            });
        });

        chrome.storage.sync.set({ 'lastVisitedUrl': currentUrl });
        console.log('Current URL:', currentUrl);
    });
});

/*
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tabId !== indexTabId) {
        // URL has changed and it's not the index.html tab
        const currentUrl = changeInfo.url;
        console.log('Current URL Change:', currentUrl);
        
        // If index.html tab is not open, open it
        if (indexTabId === null) {
            chrome.tabs.create({
                url: chrome.runtime.getURL('index.html'),
                active: true
            }, (newTab) => {
                indexTabId = newTab.id;
            });
        } else {
            // If index.html tab is already open, update its URL
            chrome.tabs.get(indexTabId, (existingTab) => {
                if (existingTab) {
                    chrome.tabs.update(indexTabId, { url: chrome.runtime.getURL('index.html') });
                } else {
                    // If the tab doesn't exist, create it
                    chrome.tabs.create({
                        url: chrome.runtime.getURL('index.html'),
                        active: true
                    }, (newTab) => {
                        indexTabId = newTab.id;
                    });
                }
            });
        }
    }
});
*/

/*
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the URL has changed and if it's not the index.html tab
    if (tabId !== indexTabId && changeInfo.url) {
        chrome.tabs.query({ currentWindow: true }, function(tabs) {
            // Check if the tab has a valid URL
            if (tab.url && tab.url !== 'chrome://newtab/') {
                // Close the tab with the new URL
                chrome.tabs.remove(tabId, function() {
                    console.log("Tab closed:", tab.url);
                });
                
                // Redirect to index.html
                if (indexTabId === null) {
                    // If index.html tab is not open, open it
                    chrome.tabs.create({
                        url: chrome.runtime.getURL('index.html'),
                        active: true
                    }, (newTab) => {
                        indexTabId = newTab.id;
                    });
                } else {
                    // If index.html tab is already open, update its URL
                    chrome.tabs.update(indexTabId, { url: chrome.runtime.getURL('index.html') });
                }
            } else {
                console.log("New tab without URL. Ignored.");
            }
        });
    }
});
*/