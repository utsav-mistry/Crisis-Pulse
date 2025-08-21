import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import pushNotificationManager from './utils/pushNotifications';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Initialize push notifications when app loads
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        pushNotificationManager.initialize().then(success => {
            if (success) {
                console.log('Push notifications initialized successfully');
            } else {
                console.log('Push notifications not available or permission denied');
            }
        });
    });
}