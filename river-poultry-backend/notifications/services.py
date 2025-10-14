import json
import base64
from django.conf import settings
from pywebpush import webpush, WebPushException
from .models import PushSubscription


class NotificationService:
    """Service for sending push notifications"""
    
    def __init__(self):
        self.vapid_private_key = getattr(settings, 'VAPID_PRIVATE_KEY', '')
        self.vapid_public_key = getattr(settings, 'VAPID_PUBLIC_KEY', '')
        self.vapid_claims = {
            "sub": f"mailto:{getattr(settings, 'VAPID_ADMIN_EMAIL', 'admin@example.com')}"
        }
    
    def send_push_notification(self, subscription: PushSubscription, payload: dict) -> bool:
        """Send a push notification to a specific subscription"""
        try:
            # Prepare subscription info
            subscription_info = {
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh_key,
                    "auth": subscription.auth_key
                }
            }
            
            # Convert payload to JSON
            payload_json = json.dumps(payload)
            
            # Send the notification
            webpush(
                subscription_info=subscription_info,
                data=payload_json,
                vapid_private_key=self.vapid_private_key,
                vapid_claims=self.vapid_claims
            )
            
            return True
            
        except WebPushException as e:
            print(f"WebPush error: {e}")
            return False
        except Exception as e:
            print(f"General error sending notification: {e}")
            return False
    
    def send_bulk_notifications(self, subscriptions: list, payload: dict) -> dict:
        """Send notifications to multiple subscriptions"""
        results = {
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        for subscription in subscriptions:
            success = self.send_push_notification(subscription, payload)
            if success:
                results['success'] += 1
            else:
                results['failed'] += 1
                results['errors'].append(f"Failed to send to {subscription.user.username}")
        
        return results
    
    def send_to_all_users(self, payload: dict) -> dict:
        """Send notification to all active subscriptions"""
        active_subscriptions = PushSubscription.objects.filter(is_active=True)
        return self.send_bulk_notifications(list(active_subscriptions), payload)
    
    def send_to_user(self, user, payload: dict) -> bool:
        """Send notification to a specific user"""
        try:
            subscription = PushSubscription.objects.get(user=user, is_active=True)
            return self.send_push_notification(subscription, payload)
        except PushSubscription.DoesNotExist:
            return False
        except Exception as e:
            print(f"Error sending to user {user.username}: {e}")
            return False


# Standalone function for easy importing
def send_push_notification(subscription: PushSubscription, title: str, body: str, 
                          icon_url: str = None, action_url: str = None, 
                          extra_data: dict = None) -> bool:
    """
    Send a push notification to a specific subscription
    
    Args:
        subscription: PushSubscription instance
        title: Notification title
        body: Notification body
        icon_url: Optional icon URL
        action_url: Optional action URL
        extra_data: Optional extra data
    
    Returns:
        bool: True if sent successfully, False otherwise
    """
    service = NotificationService()
    
    payload = {
        'title': title,
        'body': body,
        'icon': icon_url or '/static/icons/notification-icon.png',
        'url': action_url or '/',
        'data': extra_data or {}
    }
    
    return service.send_push_notification(subscription, payload)