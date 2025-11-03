import React from 'react';
import MenuBar from './src/components/MenuBar';
import Desktop from './src/components/Desktop';
import './App.css';

function App() {
  return (
    <div className="app">
      <MenuBar />
      <Desktop />
    </div>
  );
}

export default App;