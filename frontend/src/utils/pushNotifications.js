// Push Notifications Utility
// VAPID public key will be fetched from backend
let VAPID_PUBLIC_KEY = null; // Replace with actual VAPID key

class PushNotificationManager {
    constructor() {
        this.registration = null;
        this.subscription = null;
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    }

    // Initialize service worker and push notifications
    async initialize() {
        if (!this.isSupported) {
            console.log('Push notifications not supported');
            return false;
        }

        try {
            // Fetch VAPID public key from backend
            const response = await fetch('/api/push/vapid-key');
            const { publicKey } = await response.json();
            VAPID_PUBLIC_KEY = publicKey;

            // Register service worker
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', this.registration);

            // Request notification permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('Notification permission denied');
                return false;
            }

            // Subscribe to push notifications
            await this.subscribeToPush();
            return true;
        } catch (error) {
            console.error('Push notification initialization failed:', error);
            return false;
        }
    }

    // Request notification permission
    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission;
        }
        return 'denied';
    }

    // Subscribe to push notifications
    async subscribeToPush() {
        if (!this.registration) {
            throw new Error('Service worker not registered');
        }

        try {
            this.subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log('Push subscription:', this.subscription);

            // Send subscription to backend
            await this.sendSubscriptionToBackend();
            return this.subscription;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            throw error;
        }
    }

    // Send subscription to backend
    async sendSubscriptionToBackend() {
        if (!this.subscription) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subscription: this.subscription.toJSON(),
                    userAgent: navigator.userAgent
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send subscription to backend');
            }

            console.log('Subscription sent to backend successfully');
        } catch (error) {
            console.error('Error sending subscription to backend:', error);
        }
    }

    // Unsubscribe from push notifications
    async unsubscribe() {
        if (this.subscription) {
            try {
                await this.subscription.unsubscribe();
                console.log('Unsubscribed from push notifications');
            } catch (error) {
                console.error('Error unsubscribing:', error);
            }
        }
    }

    // Test notification (for admin testing)
    async sendTestNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico',
                tag: 'test-notification'
            });
        }
    }

    // Utility function to convert VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Get subscription status
    getSubscriptionStatus() {
        return {
            isSupported: this.isSupported,
            isSubscribed: !!this.subscription,
            permission: 'Notification' in window ? Notification.permission : 'denied'
        };
    }
}

export default new PushNotificationManager();
 