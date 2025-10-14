// Notification Service for PWA Push Notifications
export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class NotificationService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  private vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE4vRiSc+UUdR7ynBj0VYeIUqguO++\nRK248+yCJLwztcQqFIRktBjiHfOhsO0NSJbVZebE/4XHZ2aUOBxQagukOA==\n-----END PUBLIC KEY-----';

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check current notification permission
  getPermission(): NotificationPermission {
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribeToNotifications(): Promise<NotificationSubscription> {
    const registration = await this.registerServiceWorker();
    
    if (!registration.pushManager) {
      throw new Error('Push messaging is not supported');
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
    }

    // Convert subscription to our format
    const subscriptionData: NotificationSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };

    return subscriptionData;
  }

  // Unsubscribe from push notifications
  async unsubscribeFromNotifications(): Promise<boolean> {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration || !registration.pushManager) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }
    
    return true;
  }

  // Send subscription to backend
  async saveSubscription(subscription: NotificationSubscription, userId?: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          subscription,
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  // Remove subscription from backend
  async removeSubscription(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/unsubscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription');
      }
    } catch (error) {
      console.error('Error removing subscription:', error);
      throw error;
    }
  }

  // Show local notification (for testing)
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/river-poultry-logo.png',
        badge: payload.badge || '/river-poultry-logo.png',
        tag: payload.tag || 'river-poultry-notification',
        data: payload.data || {},
        actions: payload.actions || [
          {
            action: 'view',
            title: 'View',
            icon: '/river-poultry-logo.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });
    } else {
      // Fallback to regular notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/river-poultry-logo.png'
      });
    }
  }

  // Setup complete notification system
  async setupNotifications(userId?: number): Promise<boolean> {
    try {
      // Check support
      if (!this.isSupported()) {
        console.warn('Notifications not supported');
        return false;
      }

      // Request permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Subscribe to push notifications
      const subscription = await this.subscribeToNotifications();
      
      // Save subscription to backend
      await this.saveSubscription(subscription, userId);
      
      console.log('Notifications setup complete');
      return true;
    } catch (error) {
      console.error('Error setting up notifications:', error);
      return false;
    }
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const notificationService = new NotificationService();

