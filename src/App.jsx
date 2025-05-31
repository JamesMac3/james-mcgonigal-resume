import React from 'react';
import ResumeWebsite from './ResumeWebsite';    // <-- Import the component, not just the file path
import './App.css';

function App() {
  return (
    <>
      <ResumeWebsite />   {/* <-- Use a self-closing tag */}
    </>
  );
}

export default App;