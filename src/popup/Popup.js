/*global chrome*/
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import URLTableMenu from '../components/URLTableMenu';

function Popup() {
    const [extensionStatus, setExtensionStatus] = useState(true);
    const [Url, setUrl] = useState(''); 

    useEffect(() => {
        const handleTabUpdate = (tabId, changeInfo, tab) => {
            if (extensionStatus && changeInfo.status === "complete") {
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    const currentUrl = tabs[0].url;
                    console.log("Received current URL:", currentUrl);
                    showNotification(currentUrl);
                });
            }
        };

        // Add listener for tab updates
        chrome.tabs.onUpdated.addListener(handleTabUpdate);

        return () => {
            // Remove listener when component unmounts
            chrome.tabs.onUpdated.removeListener(handleTabUpdate);
        };
    }, [extensionStatus]);

    const showNotification = (url) => {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'logo192.png',
            title: 'Simple Notification',
            message: 'You are in ' + url,
        });
    };

    const handleClickOFF = () => {
        setExtensionStatus(false);
        console.log('extension is OFF')
    }
    const handleClickON = () => {
        setExtensionStatus(true);
        console.log('extension is ON')
    }

    return (
    <>
    <div>
      <button onClick={showNotification}>Show Notification</button>
    </div>
        <div class="w-80 h-96 bg-sky-200 flex flex-col items-center justify-center p-3 border-white">
            <div class="text-3xl font-bold text-sky-400 ">
                <a>ExtenAlert!</a>
            </div>
            <div class="w-full flex justify-center mt-2">
                <Button 
                    sx={{
                        width:'50%', 
                        borderRadius:'0',
                        backgroundColor: extensionStatus ? '#38bdf8' : '#bae6fd',
                        boxShadow:'none',
                        '&:hover': {
                            backgroundColor: '#5ac8fa',
                            boxShadow:'none'
                        },
                    }} 
                    disabled={!extensionStatus} 
                    onClick={handleClickOFF}
                    variant="contained">OFF
                </Button>
                <Button 
                    sx={{
                        width:'50%', 
                        borderRadius:'0',
                        backgroundColor: extensionStatus ? '#bae6fd' : '#38bdf8',
                        boxShadow:'none',
                        '&:hover': {
                            backgroundColor: '#5ac8fa',
                            boxShadow:'none'
                        },
                    }} 
                    disabled={extensionStatus} 
                    onClick={handleClickON}
                    variant="contained">ON
                </Button>
            </div>     
            <URLTableMenu/>     
        </div>
    </>
  );
}

export default Popup;