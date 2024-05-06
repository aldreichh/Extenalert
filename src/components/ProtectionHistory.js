/*global chrome*/
import React, { useState, useEffect} from 'react';
import axios from 'axios';

const YourComponent = () => {
  const [api, setAPI] = useState('e606af073d0c541c38b356e1f3590364cde310c12f202bf4b731c73ab02246d8');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [lastVisitedUrl, setLastVisitedUrl] = useState('');
  const [userAnswer, setUserAnswer] = useState(null);

  useEffect(() => {
        // Retrieve the URL from Chrome storage
        chrome.storage.sync.get(['lastVisitedUrl', 'userAnswer'], function(result) {
            if (result.lastVisitedUrl) {
                setLastVisitedUrl(result.lastVisitedUrl);
            }
            if (result.userAnswer) {
                setUserAnswer(result.userAnswer);
            }
        });
  }, []); 
  
  /*
  const handleClick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentUrl = tabs[0].url;
      console.log('Current URL:', currentUrl);
      const url = new URL(currentUrl);
      const baseDomain = `${url.protocol}//${url.hostname}`;
      console.log('Base Domain:', baseDomain);

      try {
        const response = await axios.get(`http://localhost:5000/url-report?apikey=${api}&resource=${baseDomain}&allinfo=false&scan=0`);
        console.log(response.data);
        setReport(response.data);
        setError(null);
      } catch (error) {
        console.log(error.response.data.error);
        setError(error.response.data.error);
        setReport(null);
      } 
    });
  };
  */


  return (
    <>
    <p>Last visited URL: {lastVisitedUrl}</p>
    <p>User Prompt Answer: {userAnswer}</p>
      <div>
        <button >Send VirusTotal Request</button>
      </div>
    </>
  );

};

export default YourComponent;
