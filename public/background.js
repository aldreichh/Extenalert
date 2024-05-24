console.log('Background script executing...');

//PHISHING URL SCANNING USING VIRUSTOTAL API
chrome.webNavigation.onCompleted.addListener(function(details) {
    chrome.storage.local.get(['WhitelistedURLs', 'UserAPIkey', 'BlacklistedURLs', 'ExtensionStatus'],function(result) {

        //get data from local storage
        const storedData = result.WhitelistedURLs || []; 
        const blacklistedURLs = result.BlacklistedURLs || [];
        const status = result.ExtensionStatus || "Active";
        const api = result.UserAPIkey || 'e606af073d0c541c38b356e1f3590364cde310c12f202bf4b731c73ab02246d8';
        chrome.storage.local.set({ 'currentUrl': details.url });
        console.log(storedData);
        console.log(api);
        console.log(status);

        //chrome.tabs.sendMessage(details.tabId, { action: "checkUrl", url: details.url });
        if (details.frameId === 0) {
            // The main frame has fully loaded
            chrome.tabs.get(details.tabId, function(tab) {
                // Log or use the URL of the fully loaded tab
                console.log('URL after full load:', tab.url);
                if(status==="Active"){
                    const currentUrl = tab.url;
                    const parsedUrl = new URL(currentUrl);
                    // Reconstruct the base URL
                    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`;
        
                    if (!baseUrl || baseUrl.match(/^chrome:\/\//) || baseUrl.startsWith("about:blank") || baseUrl.startsWith("about://") || baseUrl.startsWith("file:///")) {
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
                                                    else return;
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
                                                        const tabId = tabs[0].id;
                                                        chrome.tabs.remove(tabId, function() {
                                                        console.log(`Tab with ID ${tabId} has been closed.`);
                                                        return;
                                                        });
                                                    }
                                                    else return;
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
                                                        const tabId = tabs[0].id;
                                                        chrome.tabs.remove(tabId, function() {
                                                        console.log(`Tab with ID ${tabId} has been closed.`);
                                                        return;
                                                        });
                                                    }
                                                    else return;
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
                }
                else return;
            });
        }
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

//DRIVE-BY DOWNLOAD FEATURE
let userInitiated = false;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    chrome.storage.local.get('ExtensionStatus',function(result) {
        const status = result.ExtensionStatus || "Active";
        if(status === "Active"){
            if (message.type === "USER_INITIATED_DOWNLOAD") {
                userInitiated = true;
                setTimeout(() => {
                userInitiated = false;
                }, 3000); // Consider the download user-initiated for 3 seconds
            }
        }
        else return;
    });
});

// Listen for download events
/*
chrome.downloads.onCreated.addListener((downloadItem) => {
    chrome.storage.local.get('ExtensionStatus',function(result) {
        const status = result.ExtensionStatus || "Active";
        if(status === "Active"){
            if (userInitiated) {
                console.log("User-initiated download detected:", downloadItem);
            } else {
                console.warn("Drive-by download detected:", downloadItem);
                // Optionally, cancel the download
                chrome.downloads.cancel(downloadItem.id);
            }
        }
        else return;
    });
});
*/

let userClickTimestamp = 0;
let lastClickedElementUrl = '';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'userClick') {
    userClickTimestamp = Date.now();
    lastClickedElementUrl = message.url;
  }
});

// Listen for downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
    const currentTime = Date.now();
    const timeDifference = currentTime - userClickTimestamp;
    // Define a threshold (e.g., 5 seconds) to consider a download as user-initiated
    const userInitiatedThreshold = 5000;

    if (timeDifference <= userInitiatedThreshold && (downloadItem.url === lastClickedElementUrl || downloadItem.referrer === lastClickedElementUrl)) {
        console.log(`Download ${downloadItem.id} is likely user-initiated.`);
    } else {
        console.log(`Download ${downloadItem.id} is likely a drive-by download.`);
    }
});
