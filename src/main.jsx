import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/main.css';
import { applySettings, loadSettings } from './components/Settings.jsx';
applySettings(loadSettings());
createRoot(document.getElementById('root')).render(<HashRouter><App /></HashRouter>);
