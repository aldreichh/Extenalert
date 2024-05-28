console.log('Background script executing...');

// PHISHING URL SCANNING USING VIRUSTOTAL API
chrome.webNavigation.onCompleted.addListener(async function(details) {
    try {
        //Get the set of local data of whitelistedurls, userapikey, blacklisterurls, and extension status
        const result = await chrome.storage.local.get(['WhitelistedURLs', 'UserAPIkey', 'BlacklistedURLs', 'ExtensionStatus']);
        const storedData = result.WhitelistedURLs || [];
        const blacklistedURLs = result.BlacklistedURLs || [];
        const status = result.ExtensionStatus || "Active";
        const api = result.UserAPIkey || 'e606af073d0c541c38b356e1f3590364cde310c12f202bf4b731c73ab02246d8';
        await chrome.storage.local.set({ 'currentUrl': details.url });

        if (details.frameId === 0 && status === "Active") {
            const tab = await chrome.tabs.get(details.tabId);
            console.log('URL after full load:', tab.url);

            const currentUrl = tab.url;
            const parsedUrl = new URL(currentUrl);
            const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`;
            //Add exception URLs
            if (!baseUrl || baseUrl.match(/^chrome:\/\//) || 
                baseUrl.startsWith("about:blank") || 
                baseUrl.startsWith("about://") || 
                baseUrl.startsWith("http://localhost/") || 
                baseUrl.startsWith("file:///")) {
                return;
            }
            //Check if the URL is whitelisted
            const alreadyVisited = storedData.some(item => item.url === baseUrl);
            let isWhitelistedURL = false;
            try {
                isWhitelistedURL = await checkWhitelist(baseUrl);
            } catch (error) {
                console.error('Error checking whitelist:', error);
            }
            //If the URL is whitelisted, return and don't execute further
            if (alreadyVisited || isWhitelistedURL) {
                return;
            }

            //Check if the URL is blacklisted
            const phishingURLs = blacklistedURLs.some(item => item.url === baseUrl);
            let isBlacklistedURL = false;
            try {
                isBlacklistedURL = await checkBlacklist(baseUrl);
            } catch (error) {
                console.error('Error checking blacklist:', error);
            }

            //If the URL is in the blacklisted list
            if (phishingURLs || isBlacklistedURL) {
                console.log('Block URL detected');
                try {
                    //Show the alert prompt
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    await sendMessageWithResponse(tabs[0].id, { threatDetected: phishingURLs }, (response) => {
                        console.log(response?.answer);
                        if (response?.answer === true) {
                            //Close the blocked URL tab
                            const tabId = tabs[0].id;
                            chrome.tabs.remove(tabId, () => {
                                console.log(`Tab with ID ${tabId} has been closed.`);
                            });
                        }
                        const tabId = tabs[0].id;
                        chrome.tabs.remove(tabId, () => {
                            console.log(`Tab with ID ${tabId} has been closed.`);
                        });
                    });
                } catch (error) {
                    console.error('Error sending message to content script:', error);
                }
                return;
            }

            //If current URL has not been found in the blacklisted and whitelisted URLs
            try {
                //Show the prompt to scan the current URL 
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                await sendMessageWithResponse(tabs[0].id, { prompt: true }, async (response) => {
                    if (response && response.answer !== undefined) {
                        await chrome.storage.local.set({ 'userAnswer': response.answer });
                        console.log('User answer:', response.answer);
                        //If the user click the OK button 
                        if (response.answer === true) {
                            //Send the data to node.js server API endpoint for VirusTotal scanning
                            const url = `http://localhost:5000/url-report?apikey=${api}&resource=${baseUrl}&allinfo=false&scan=0`;

                            try {
                                const fetchResponse = await fetch(url);
                                const data = await fetchResponse.json();

                                //Get the threat level by calling the getThreatLevel function
                                const threatLevel = getThreatLevel(data);

                                //Show a prompt to notify the user the result of the scan
                                await sendMessageWithResponse(tabs[0].id, { threatLevel: threatLevel }, async (response) => {
                                    console.log(`User response from ${threatLevel} script:`, response?.answer);

                                    //Send the result to ExtenAlert! database using the AddDataToServer function
                                    if (response?.answer === true) {
                                        const status = threatLevel === 'Low Threat Level' ? 'benign' : 'phishing';
                                        await addDataToServer(baseUrl, status);

                                        const listToUpdate = status === 'benign' ? storedData : blacklistedURLs;
                                        listToUpdate.push({ id: Date.now(), url: baseUrl });
                                        const storageKey = status === 'benign' ? 'WhitelistedURLs' : 'BlacklistedURLs';
                                        
                                        await chrome.storage.local.set({ [storageKey]: listToUpdate });
                                        console.log(listToUpdate);

                                        if (status === 'phishing') {
                                            const tabId = tabs[0].id;
                                            chrome.tabs.remove(tabId, () => {
                                                console.log(`Tab with ID ${tabId} has been closed.`);
                                            });
                                        }
                                    }
                                });
                            } catch (error) {
                                await sendMessageWithResponse(tabs[0].id, { promptError: 'An error has occurred.' }, (response) => {
                                    console.log("User Response", response?.answer);
                                });
                            }
                        } else {
                            console.log('Scan cancelled');
                        }
                    }
                });
            } catch (error) {
                console.error('Error querying tabs or sending message:', error);
            }

            await chrome.storage.sync.set({ 'lastVisitedUrl': baseUrl });
            console.log('Current URL:', baseUrl);
        }
    } catch (error) {
        console.error('Error in webNavigation onCompleted listener:', error);
    }
});

// Function to send message to content script and handle errors
async function sendMessageWithResponse(tabId, message, callback) {
    try {
        const response = await chrome.tabs.sendMessage(tabId, message);
        callback(response);
    } catch (error) {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
            console.error('Error sending message:', error);
        }
    }
}

// Function to add data to server
async function addDataToServer(url, status) {
    try {
        const response = await fetch('http://localhost:5000/add-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, status }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Data added successfully:', data.message);
        } else {
            console.error('Failed to add data:', data.error);
        }
    } catch (error) {
        console.error('Error adding data to server:', error);
    }
}

// Function to check if a URL is whitelisted
async function checkWhitelist(url) {
    try {
        const response = await fetch(`http://localhost:5000/check-whitelist?url=
        ${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.isWhitelisted;
    } catch (error) {
        console.error('Error checking whitelist:', error);
        return false;
    }
}
// Function to check if a URL is blacklisted
async function checkBlacklist(url) {
    try {
        const response = await fetch(`http://localhost:5000/check-blacklist?url=
        ${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.isBlacklisted;
    } catch (error) {
        console.error('Error checking blacklist:', error);
        return false;
    }
}

// Function to get threat level from data
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

//Drive-by Download Detection
const userInitiatedDownloads = new Set();
let isDriveByDownload = false;

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.url && message.userInitiated) {
        userInitiatedDownloads.add(message.url);
        sendResponse({ status: 'URL added' });
    }
});

// Listen for new downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
    if (userInitiatedDownloads.has(downloadItem.url)) {
        console.log(`User-initiated download detected: ${downloadItem.url}`);
        userInitiatedDownloads.delete(downloadItem.url);
    } else {
        console.log(`Drive-by download detected: ${downloadItem.url}`);
        isDriveByDownload = true;
        handleDriveByDownload(isDriveByDownload);
        // Cancel the download
        chrome.downloads.cancel(downloadItem.id);
    }
});

function handleDriveByDownload(isDriveByDownload) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0 && isDriveByDownload) {
            chrome.tabs.sendMessage(tabs[0].id, { isDriveByDownload: true }, function(response) {
                console.log(response?.answer);
            });
        }
    });
}

