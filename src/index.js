import React from 'react';
import ReactDOM from 'react-dom/client'; 
import './index.css';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root')); 
root.render(
  <React.StrictMode>
    <App />  {/* 渲染 App 組件 */}
  </React.StrictMode>
);
