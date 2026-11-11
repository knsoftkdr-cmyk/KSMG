import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/main.css';
import { applySettings, loadSettings } from './components/Settings.jsx';
applySettings(loadSettings());
createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
