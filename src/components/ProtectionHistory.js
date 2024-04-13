/*global chrome*/
import React, { useState } from 'react';

function ProtectionHistory() {
    const [currentURL, setCurrentURL] = useState('');
    
    const handleClick = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const currentUrl = tabs[0].url;
          console.log(currentUrl);
          setCurrentURL(currentUrl);
        });
    };
    return(
        <>
            Protection
            <button onClick={handleClick}>Get Current URL</button>
            {currentURL}
        </>
    );
}
export default ProtectionHistory;