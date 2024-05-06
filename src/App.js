/*global chrome*/
import { BrowserRouter as Router, Routes, Route, Navigate  } from "react-router-dom";
import React from 'react';
import Popup from './popup/Popup';
import Prompt from './popup/Prompt';

function App(){
  return (
    <Router>
      <Routes>
        <Route path="/index.html" element={<Popup />} />
        <Route path="/prompt" element={<Prompt />} />
      </Routes>
    </Router> 
  );
}

export default App;