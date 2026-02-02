import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Handle Google OAuth Redirect (Query Params -> Hash)
if (window.location.pathname === '/oauth2callback' && window.location.search) {
  const newUrl = window.location.origin + '/#/oauth2callback' + window.location.search;
  window.location.replace(newUrl);
}

root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
