/*global chrome*/
import React, { useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function WhitelistedUrls() {
    const [data, setData] = useState([]);
    const [blacklisted, setBlacklisted] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [labelMessage, setLabelMessage] = useState('Input URL (ex. google.com)');

    useEffect(() => {
        chrome.storage.local.get(['WhitelistedURLs', 'BlacklistedURLs'] , function(result) {
            const chromeWhiteLocalStorage = result.WhitelistedURLs || [];
            const chromeBlockLocalStorage = result.BlacklistedURLs || [];
            setData(chromeWhiteLocalStorage);
            setBlacklisted(chromeBlockLocalStorage);
        });
    }, []);

    const handleURLChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleAddURL = () => {
        if (inputValue.trim() !== '') {
            let formattedURL = inputValue.trim().toLowerCase(); // Convert to lowercase
            // Check if the URL does not start with http:// or https://
            if (!/^https?:\/\//i.test(formattedURL)) {
                // Add https://www. at the beginning and / at the end
                formattedURL = 'https://www.' + formattedURL.replace(/^(www\.)/i, '') + '/';
            }
            const exists = blacklisted.some(item => item.url === formattedURL);
            if(!exists){
                const newData = {
                    id: Date.now(), 
                    url: formattedURL
                };
                setData(prevData => [...prevData, newData]);
                const localStorageData = [...data, newData];
                chrome.storage.local.set({ 'WhitelistedURLs': localStorageData });
                localStorage.setItem('WhitelistedURLs', JSON.stringify(localStorageData));
                setLabelMessage('Input URL (ex. google.com)')
                setInputValue('');
            }
            else{
                setLabelMessage('URL exists in Blacklisted URLs');
            }
        }
    }

    const handleDeleteURL = (id) => {
        const newData = data.filter(item => item.id !== id);
        setData(newData);
        localStorage.setItem('WhitelistedURLs', JSON.stringify(newData));
        
        chrome.storage.local.get('WhitelistedURLs', function(result) {
            const storedData = result.WhitelistedURLs || [];
            const updatedData = storedData.filter(item => item.id !== id);
            chrome.storage.local.set({ 'WhitelistedURLs': updatedData });
        });
    }

    return(
        <>
            <div className="">
                <div className="flex">
                    <TextField
                        sx={{
                            width:'70%',
                            backgroundColor: 'white',
                            borderRadius: '5px'
                        }}
                        label={labelMessage}
                        size="small"
                        variant="outlined"
                        onChange={handleURLChange}
                    />
                    <Button 
                        variant="contained"
                        sx={{
                            width:'30%', 
                            marginLeft: '5px',
                            borderRadius:'10',
                            backgroundColor: '#4ade80',
                            boxShadow:'none',
                            '&:hover': {
                                backgroundColor: '#22c55e',
                                boxShadow:'none'
                            },
                        }} 
                        onClick={handleAddURL}
                    >
                        Add URL
                    </Button>
                </div>
                <div class="mt-2 overflow-auto h-50">
                    <table className="min-w-full divide-y divide-gray-200 ">
                        <tbody className="divide-y divide-slate-400">
                            {data.map((row, index) => (
                                <tr key={index}>
                                    <td className="px-1 py-2 whitespace-nowrap text-left text-sm">{row.url}</td>
                                    <td className="px-1 py-2 whitespace-nowrap text-right">
                                        <Button
                                            variant="contained"
                                            onClick={() => handleDeleteURL(row.id)}
                                            sx={{
                                                padding: '5px',
                                                width:'20%', 
                                                borderRadius:'10',
                                                backgroundColor: '#ef4444',
                                                boxShadow:'none',
                                                '&:hover': {
                                                    backgroundColor: '#dc2626',
                                                    boxShadow:'none'
                                                },
                                            }} 
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
export default WhitelistedUrls;