/*global chrome*/
import Button from '@mui/material/Button';
import React, { useState, useEffect} from 'react';
import URI from 'urijs';

function ScanWebsite (){
    const [currentUrl , setCurrentUrl] = useState('');
    const [isPhishing, setIsPhishing] = useState(null);
    
    useEffect(() => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            const url = tabs[0].url;
            setCurrentUrl(url);
        });
    }, []);

    const handleButtonClick = () => {
        const whitelist = [

            
        ];

        const blacklist = [
        
        ];

        // regex patterns for phishing indicators
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
        const isWhitelisted = whitelist.some(whitelistedDomain => domain.includes(whitelistedDomain));

        // Check if the domain is in the blacklist
        const isBlacklisted = blacklist.some(blacklistedDomain => domain.includes(blacklistedDomain));

        // Determine phishing status
        let isPhishingUrl = false;

        if (isBlacklisted) {
            isPhishingUrl = true;
        } else if (isWhitelisted) {
            isPhishingUrl = false;
        } else {
            // Check the URL against the regex patterns if not whitelisted or blacklisted
            isPhishingUrl = phishingPatterns.some(pattern => pattern.test(currentUrl) || pattern.test(domain));
        }

        // Set the phishing status
        setIsPhishing(isPhishingUrl);
    };


    return (
        <>
            <div className="mt-2 w-full">
                <Button
                    variant="contained"
                    sx={{
                        padding: '5px',
                        width:'100%', 
                        borderRadius:'0',
                        backgroundColor: '#075985',
                        boxShadow:'none',
                        '&:hover': {
                            backgroundColor: '#0c4a6e',
                            boxShadow:'none'
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
            </div>

        </>
    );
}

export default ScanWebsite;