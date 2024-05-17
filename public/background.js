console.log('Background script executing...');


chrome.webNavigation.onCompleted.addListener(function(details) {
    chrome.storage.local.get(['WhitelistedURLs', 'UserAPIkey', 'BlacklistedURLs'],function(result) {
        const storedData = result.WhitelistedURLs || []; 
        const blacklistedURLs = result.BlacklistedURLs || [];
        const api = result.UserAPIkey || 'e606af073d0c541c38b356e1f3590364cde310c12f202bf4b731c73ab02246d8';
        console.log(storedData);
        console.log(api);

        const currentUrl = details.url;
        const parsedUrl = new URL(currentUrl);
        // Reconstruct the base URL
        const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`;

        if (!baseUrl || baseUrl.match(/^chrome:\/\//) || baseUrl.startsWith("about:blank") || baseUrl.startsWith("about://")) {
            return;
        }
        
        const alreadyVisited = storedData.some(item => item.url === baseUrl);
        if (alreadyVisited) {
            return;
        }

        const phishingURLs = blacklistedURLs.some(item => item.url === baseUrl);
        if (phishingURLs) {
            console.log('Block URL detected');
            // Close the current tab
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { threatDetected: phishingURLs }, function(response) {
                console.log(response.answer);
                if(response.answer===true || response.answer===false || response.answer===undefined ){
                    const tabId = tabs[0].id;
                    chrome.tabs.remove(tabId, function() {
                    console.log(`Tab with ID ${tabId} has been closed.`);
                    return;
                    });
                }
                });
            });
        }
        else{
            // If no match is found, show the prompt
            chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { prompt: true }, async function(response) {
                    if (response && response.answer !== undefined) {
                        chrome.storage.local.set({ 'userAnswer': response.answer });
                        console.log('User answer:', response.answer);
            
                        if(response.answer===true){
                            // Fetch data from the URL 
                            const url = `http://localhost:5000/url-report?apikey=${api}&resource=${baseUrl}&allinfo=false&scan=0`;
                
                            try {
                                const fetchResponse = await fetch(url);
                                const data = await fetchResponse.json();
                                const threatLevel = getThreatLevel(data);
                                if (threatLevel === 'Low Threat Level') {
                                    chrome.tabs.sendMessage(tabs[0].id, { threatLevel: threatLevel }, function(response) {
                                        console.log("User response from Low Threat Level script:", response.answer);
                                        if(response.answer===true){
                                            storedData.push({ 
                                                id: Date.now(),
                                                url: baseUrl });
                                            chrome.storage.local.set({ 'WhitelistedURLs' : storedData });
                                            console.log(storedData);
                                            const confirmation = "success";
                                            chrome.tabs.sendMessage(tabs[0].id, { confirmation: confirmation }, function(response) {});
                                        }
                                        else{
                                            return;
                                        }
                                    });
                                }
                                else if (threatLevel === 'Moderate Threat Level') {
                                    chrome.tabs.sendMessage(tabs[0].id, { threatLevel: threatLevel }, function(response) {
                                        console.log("User response from Moderate Threat Level script:", response.answer);
                                        if(response.answer===true){
                                            blacklistedURLs.push({ 
                                                id: Date.now(),
                                                url: baseUrl });
                                            chrome.storage.local.set({ 'BlacklistedURLs' : blacklistedURLs });
                                            console.log(blacklistedURLs);
                                            //Close the tab
                                            chrome.tabs.sendMessage(tabs[0].id, { threatDetected: phishingURLs }, function(response) {
                                                console.log(response.answer);
                                                if(response.answer===true || response.answer===false || response.answer===undefined ){
                                                    const confirmation = "success";
                                                    chrome.tabs.sendMessage(tabs[0].id, { confirmation: confirmation }, function(response) {});
                                                    const tabId = tabs[0].id;
                                                    chrome.tabs.remove(tabId, function() {
                                                    console.log(`Tab with ID ${tabId} has been closed.`);
                                                    return;
                                                    });
                                                }
                                            });
                                        }
                                        else{
                                            return;
                                        }
                                    });
                                }
                                else if (threatLevel === 'High Threat Level') {
                                    chrome.tabs.sendMessage(tabs[0].id, { threatLevel: threatLevel }, function(response) {
                                        console.log("User response from High Threat Level script:", response.answer);
                                        if(response.answer===true){
                                            blacklistedURLs.push({ 
                                                id: Date.now(),
                                                url: baseUrl });
                                            chrome.storage.local.set({ 'BlacklistedURLs' : blacklistedURLs });
                                            console.log(blacklistedURLs);
                                            //Close the tab
                                            chrome.tabs.sendMessage(tabs[0].id, { threatDetected: phishingURLs }, function(response) {
                                                console.log(response.answer);
                                                if(response.answer===true || response.answer===false || response.answer===undefined ){
                                                    const confirmation = "success";
                                                    chrome.tabs.sendMessage(tabs[0].id, { confirmation: confirmation }, function(response) {});
                                                    const tabId = tabs[0].id;
                                                    chrome.tabs.remove(tabId, function() {
                                                    console.log(`Tab with ID ${tabId} has been closed.`);
                                                    return;
                                                    });
                                                }
                                            });
                                        }
                                        else{
                                            return;
                                        }
                                    });
                                }
                                console.log(threatLevel);
                                console.log('Data from URL:', data);
                            } catch (error) {
                                const promptError = 'An error has occured.';
                                chrome.tabs.sendMessage(tabs[0].id, { promptError: promptError }, function(response) {
                                    console.log("User Response", response.answer);
                                });
                            }
                        }
                        else{
                            console.log('Scan cancelled')
                        }
                    }
                });
            });
        }
        chrome.storage.sync.set({ 'lastVisitedUrl': currentUrl });
        console.log('Current URL:', baseUrl);
    });
});

function getThreatLevel(data) {
    const numPhishingDetected = Object.values(data.scans).filter(scan => scan.detected && scan.result === 'phishing site').length;

    if (numPhishingDetected === 0) {
        return "Low Threat Level";
    } else if (numPhishingDetected <= 3) {
        return "Moderate Threat Level";
    } else {
        return "High Threat Level";
    }
}

//let indexTabId = null;

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