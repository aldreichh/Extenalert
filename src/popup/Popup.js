/*global chrome*/
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import URLTableMenu from '../components/URLTableMenu';
import ScanWebsite from '../components/ScanWebsite';
import AddAPIKey from '../components/AddAPIKey';

function Popup() {
    const statusInfo = localStorage.getItem('status');
    const [extensionStatus, setExtensionStatus] = useState();
    const [status, setStatus] = useState('');
    
    useEffect(() => {
        if (statusInfo === 'Inactive') {
            setExtensionStatus(false);
            setStatus('Inactive');
        } else {
            setExtensionStatus(true);
            setStatus('Active');
        }
    }, [statusInfo]);

    const handleClickOFF = () => {
        setExtensionStatus(false);
        setStatus('Inactive');
        localStorage.setItem('status', 'Inactive');
    }
    const handleClickON = () => {
        setExtensionStatus(true);
        setStatus('Active');
        localStorage.setItem('status', 'Active');
    }

    return (
    <>
        <div class="w-96 h-96 bg-sky-200 flex flex-col items-center justify-center p-3 border-white">
            <div class="text-3xl font-bold text-sky-400 ">
                <a>ExtenAlert!</a>
            </div>
            <div class="text-lg font-semibold text-sky-400 align-left">
                <a>Status: </a>
                <span className={status === 'Active' ? 'text-green-500' : 'text-red-500'}>{status}</span>
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
                    title="Deactive Phishing and Drive-by downloads detection"
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
                    title="Activate Phishing and Drive-by downloads detection"
                    variant="contained">ON
                </Button>
            </div>     
            <ScanWebsite/>
            <AddAPIKey/>
            <URLTableMenu/>                 
        </div>
    </>
  );
}

export default Popup;