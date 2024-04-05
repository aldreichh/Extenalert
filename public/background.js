console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension Installed');
  });
  
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      console.log('Tab Updated:', tab.url);
      // You can perform actions here whenever a tab is updated
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("Received message from React component:", message);
    
    // Add your background logic here
    
    // You can respond back to the sender if needed
    sendResponse({ received: true });
  });


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "getCurrentUrl") {
    // Fetch the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      // Extract the URL from the active tab
      const currentUrl = tabs[0].url;
      
      // Send the current URL to your React component
      chrome.runtime.sendMessage({ action: "sendCurrentUrl", url: currentUrl });
    });
    }
});