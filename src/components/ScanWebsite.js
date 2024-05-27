/*global chrome*/
import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import URI from 'urijs';

async function checkWhitelist(url) {
    try {
        const response = await fetch(`http://localhost:5000/check-whitelist?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.isWhitelisted;
    } catch (error) {
        console.error('Error checking whitelist:', error);
        return false;
    }
}

async function checkBlacklist(url) {
    try {
        const response = await fetch(`http://localhost:5000/check-blacklist?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.isBlacklisted;
    } catch (error) {
        console.error('Error checking blacklist:', error);
        return false;
    }
}

function ScanWebsite() {
    const [currentUrl, setCurrentUrl] = useState('');
    const [isPhishing, setIsPhishing] = useState(null);
    const [status, setStatus] = useState('');
    const [buttonEnable, setbuttonEnable] = useState(false);
    const [buttonVisible, setButtonVisible] = useState(false);
    const [message, setMessage] = useState('SEND DATA TO EXTENALERT!');
    const [isMatched, setIsMatched] = useState(false);
    const [localData, setLocalData] = useState([]);
    
    useEffect(() => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            const url = tabs[0].url;
            setCurrentUrl(url);
        });
        const dataFromLocalStorage = JSON.parse(localStorage.getItem('sentData')) || [];
        setLocalData(dataFromLocalStorage);
    }, []);

    const handleButtonClick = async () => {
        // Regex patterns for phishing indicators
        const phishingPatterns = [
            /login/i,                      // Contains "login"
            /verify/i,                     // Contains "verify"
            /account/i,                    // Contains "account"
            /update/i,                     // Contains "update"
            /secure/i,                     // Contains "secure"
            /confirm/i,                    // Contains "confirm"
            /webscr/i,                     // Contains "webscr" (common in phishing URLs)
            /bank|paypal|apple|google/i,   // Contains common target keywords
            /\d{2,}\.\d{2,}\.\d{2,}\.\d{2,}/,  // IP address in URL
            /@/,                           // @ symbol in URL
            /-|_/,                         // Hyphen or underscore in domain
            /\.top|\.info|\.xyz|\.club|\.online|\.support/i,  // Suspicious TLDs
            /^.{50,}$/,                    // URL length over 50 characters
            /(\w+\.){3,}\w+/,              // Multiple subdomains
            /%[0-9a-f]{2}/i,               // Percent-encoded characters
            /[!$&'()*+,;=]/,               // Unusual characters in URL
        ];
        // Parse the URL using the URI library
        const parsedUrl = URI(currentUrl);
        const domain = parsedUrl.hostname();
        // Check if the domain is in the whitelist
        const isWhitelisted = await checkWhitelist(currentUrl);
        // Check if the domain is in the blacklist
        const isBlacklisted = await checkBlacklist(currentUrl);
        // Determine phishing status
        let isPhishingUrl = false;
        const isCurrentUrlStored = localData.some(data => data.url === currentUrl);
        if (isCurrentUrlStored) {
            setbuttonEnable(true); // Disable the button if currentUrl is already stored
            setMessage('This URL has already been reported');
        }
        else if (isBlacklisted) {
            console.log('blacklisted')
            isPhishingUrl = true;
            setStatus('phishing');
            setIsMatched(true);
            setMessage('Already in the Database');
        } else if (isWhitelisted) {
            console.log('whitelisted');
            isPhishingUrl = false;
            setStatus('benign');
            setIsMatched(true);
            setMessage('Already in the Database');
        } else {
            console.log('via regex');
            // Check the URL against the regex patterns if not whitelisted or blacklisted
            isPhishingUrl = phishingPatterns.some(pattern => pattern.test(currentUrl) || pattern.test(domain));
            setStatus(isPhishingUrl ? 'phishing' : 'benign');
            setIsMatched(false);
        }
        // Set the phishing status
        setIsPhishing(isPhishingUrl);
        setButtonVisible(true);
    };

    const handleSendData = async () => {
        try {
            const response = await fetch('http://localhost:5000/add-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: currentUrl, status }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Data added successfully:', data.message);
                setbuttonEnable(true);
                setMessage('Data has been sent successfully');
    
                // Store data in localStorage
                const storedData = JSON.parse(localStorage.getItem('sentData')) || [];
                storedData.push({ url: currentUrl, status });
                localStorage.setItem('sentData', JSON.stringify(storedData));
            } else {
                console.error('Failed to add data:', data.error);
            }
        } catch (error) {
            console.error('Error adding data to server:', error);
        }
    }
    

    return (
        <>
            <div className="mt-2 w-full">
                <Button
                    variant="contained"
                    sx={{
                        padding: '5px',
                        width: '100%', 
                        borderRadius: '0',
                        backgroundColor: '#075985',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#0c4a6e',
                            boxShadow: 'none'
                        },
                    }} 
                    onClick={handleButtonClick}
                > 
                    Scan This Website
                </Button>
                {isPhishing !== null && (
                    <div className="mt-2 w-full">
                        {isPhishing ? (
                            <p style={{ color: 'red' }}>Warning: This URL may be a phishing site.</p>
                        ) : (
                            <p style={{ color: 'green' }}>This URL seems safe.</p>
                        )}
                        {currentUrl}
                    </div>
                )}
                {buttonVisible && (  // Conditionally render the button
                    <Button
                        variant="contained"
                        disabled={buttonEnable || isMatched}
                        sx={{
                            marginTop: '2px',
                            padding: '5px',
                            width: '100%', 
                            borderRadius: '0',
                            backgroundColor: '#4ade80',
                            boxShadow:'none',
                            '&:hover': {
                                backgroundColor: '#22c55e',
                                boxShadow:'none'
                            },
                        }} 
                        onClick={handleSendData}
                    > 
                        {message}
                    </Button>
                )}
            </div>
        </>
    );
}

export default ScanWebsite;
