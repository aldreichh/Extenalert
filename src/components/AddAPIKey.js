/* global chrome */
import React, { useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function AddAPIKey () {
    const [inputAPIkey, setInputAPIkey] = useState('');
    const [APIkey, setAPIkey] = useState('');

    const handleAPIkey = (e) => {
        setInputAPIkey(e.target.value);
    }

    const handleAddAPIkey = () => {
        if (APIkey === '' && inputAPIkey !== '') {
            chrome.storage.local.set({ 'UserAPIkey': inputAPIkey }, function() {
                console.log('APIkey added in chrome.storage.local');
            });
            localStorage.setItem('UserAPIkey', JSON.stringify(inputAPIkey));
            setAPIkey(inputAPIkey);
            console.log('APIkey added in local storage');
        } else {
            setAPIkey('');
            localStorage.removeItem('UserAPIkey');
            chrome.storage.local.remove('UserAPIkey', function() {
                console.log('UserAPIkey removed from chrome.storage.local');
            });
        }
    }

    useEffect(() => {
        const storedAPIkey = JSON.parse(localStorage.getItem('UserAPIkey')) || '';
        setAPIkey(storedAPIkey);
        console.log('Stored API key:', storedAPIkey);
    }, []);

    return (
        <div className="flex mt-2 w-full">
            <TextField
                sx={{
                    width: '70%',
                    backgroundColor: 'white',
                    borderRadius: '5px'
                }}
                label={APIkey ? APIkey : 'Input your VirusTotal API key'}
                size="small"
                variant="outlined"
                onChange={handleAPIkey}
                disabled={!!APIkey}
            />
            <Button 
                variant="contained"
                sx={{
                    backgroundColor: APIkey ? '#ef4444' : '#4ade80',
                    width: '30%', 
                    marginLeft: '5px',
                    borderRadius: '10px',
                    boxShadow: 'none',
                    '&:hover': {
                        backgroundColor: APIkey ? '#f87171' : '#22c55e',
                        boxShadow: 'none'
                    },
                }} 
                onClick={handleAddAPIkey}
            >
                {APIkey ? 'REMOVE' : 'ADD API'}
            </Button>
        </div>
    );
}

export default AddAPIKey;