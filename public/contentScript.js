
//PHISHING URL SCANNING USING VIRUSTOTAL API
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
        const userResponse = alert("An error has occured.");   
        sendResponse({ answer: userResponse }); 
    }
    else if(message.threatDetected){
        const userResponse = alert("This URL has been blocked by ExtenAlert!");   
        sendResponse({ answer: userResponse }); 
    }
    else if(message.confirmation === "success"){
        const userResponse = alert("Successfully added!");   
        sendResponse({ answer: userResponse }); 
    }
});

/*
document.addEventListener('click', (event) => {
    let element = event.target;
  
    // Traverse up the DOM tree to find the closest anchor element if the clicked element is nested inside
    while (element && element.tagName !== 'A') {
      element = element.parentElement;
    }
  
    // If an anchor element with an href attribute is found, send the URL to the background script
    if (element && element.href) {
      // To handle scenarios where the link may trigger a download indirectly, delay the message to ensure URL capture
      setTimeout(() => {
        chrome.runtime.sendMessage({ url: element.href }, (response) => {
          console.log(response.status);
        });
      }, 500);
    }
  });
  */

//DRIVE-BY DOWNLOAD FEATURE
document.addEventListener('click', (event) => {
// Use event delegation to catch clicks on all elements
let element = event.target;

// Traverse up the DOM tree to find the clickable element
while (element && !element.href && !element.download) {
    element = element.parentElement;
}

if (element && (element.href || element.download)) {
    chrome.runtime.sendMessage({ type: "USER_INITIATED_DOWNLOAD" });
}
});



//FEATURE EXTRACTION USING URL PARSER AND REGEX
/*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
if (request.action === "checkUrl") {
    let url = request.url;
    const parsedUrl = parseUrl(url);
    if (isPhishingUrl(parsedUrl)) {
    alert("Warning: This URL might be a phishing attempt!");
    }
    else{
        alert("This URL might be safe.");
    }
}
});

function parseUrl(url) {
const urlObject = new URL(url);

const hostnameParts = urlObject.hostname.split('.');
const subdomain = hostnameParts.length > 2 ? hostnameParts.slice(0, -2).join('.') : '';
const domain = hostnameParts.slice(-2, -1)[0] || '';
const tld = hostnameParts.slice(-1)[0] || '';

const searchParams = {};
for (const [key, value] of urlObject.searchParams.entries()) {
    searchParams[key] = value;
}

return {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname,
    port: urlObject.port,
    pathname: urlObject.pathname,
    search: urlObject.search,
    hash: urlObject.hash,
    origin: urlObject.origin,
    host: urlObject.host,
    username: urlObject.username,
    password: urlObject.password,
    searchParams: searchParams,
    subdomain: subdomain,
    domain: domain,
    tld: tld,
    fullUrl: url
};
}
  
function isPhishingUrl(parsedUrl) {
const phishingPatterns = [
    /(?:login|signin|account|secure|update|confirm|verify|password|bank|ebay|paypal|apple|amazon|facebook|google|microsoft|wallet|webscr|verification|recovery)/i,
    /(?:[a-z0-9-]+\.){2,}[a-z]{2,}/i,
    /(?:\d{1,3}\.){3}\d{1,3}/i,
    /[^\w\-\.]/i, // Non-alphanumeric characters in domain name
    /@/i, // Presence of "@" symbol in URL
    /\.(?:top|xyz|club|space|online|site|website|click|link)/i // Suspicious TLDs
];

const componentsToCheck = [
    parsedUrl.hostname,
    parsedUrl.pathname,
    parsedUrl.subdomain,
    parsedUrl.domain,
    parsedUrl.fullUrl
];

// Additional heuristic checks
if (parsedUrl.fullUrl.length > 100) return true; // Check URL length
if (calculateEntropy(parsedUrl.pathname + parsedUrl.search) > 4.0) return true; // Check entropy

return componentsToCheck.some(component => phishingPatterns.some(pattern => pattern.test(component)));
}
  
function calculateEntropy(string) {
const charMap = {};
for (let i = 0; i < string.length; i++) {
    charMap[string[i]] = (charMap[string[i]] || 0) + 1;
}

let entropy = 0;
for (const key in charMap) {
    const p = charMap[key] / string.length;
    entropy -= p * Math.log2(p);
}
return entropy;
}
*/