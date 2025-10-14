from django.db import models
from django.conf import settings
import json


class PushSubscription(models.Model):
    """Model to store user push notification subscriptions"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='push_subscriptions')
    endpoint = models.URLField(max_length=500)
    p256dh_key = models.CharField(max_length=200)
    auth_key = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user', 'endpoint']
        verbose_name = 'Push Subscription'
        verbose_name_plural = 'Push Subscriptions'

    def __str__(self):
        return f"{self.user.username} - {self.endpoint[:50]}..."


class NotificationMessage(models.Model):
    """Model to store notification messages"""
    MESSAGE_TYPES = [
        ('general', 'General'),
        ('reminder', 'Reminder'),
        ('alert', 'Alert'),
        ('update', 'Update'),
        ('promotion', 'Promotion'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]

    title = models.CharField(max_length=200)
    body = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='general')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Targeting
    target_all_users = models.BooleanField(default=False)
    target_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='targeted_notifications')
    target_experience_level = models.CharField(
        max_length=20, 
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('expert', 'Expert'),
        ],
        blank=True,
        null=True
    )
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Additional data
    icon_url = models.URLField(blank=True, null=True)
    action_url = models.URLField(blank=True, null=True)
    extra_data = models.JSONField(default=dict, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_notifications')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification Message'
        verbose_name_plural = 'Notification Messages'

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

    def get_target_users(self):
        """Get the list of users this notification should be sent to"""
        if self.target_all_users:
            User = settings.AUTH_USER_MODEL
            return User.objects.filter(is_active=True)
        
        users = self.target_users.all()
        
        if self.target_experience_level:
            # Assuming you have a user profile with experience_level
            # You might need to adjust this based on your user model
            from users.models import UserProfile
            User = settings.AUTH_USER_MODEL
            profile_users = User.objects.filter(
                userprofile__experience_level=self.target_experience_level,
                is_active=True
            )
            users = users.union(profile_users)
        
        return users.distinct()


class NotificationDelivery(models.Model):
    """Model to track delivery status of notifications"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('clicked', 'Clicked'),
    ]

    notification = models.ForeignKey(NotificationMessage, on_delete=models.CASCADE, related_name='deliveries')
    subscription = models.ForeignKey(PushSubscription, on_delete=models.CASCADE, related_name='deliveries')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['notification', 'subscription']
        verbose_name = 'Notification Delivery'
        verbose_name_plural = 'Notification Deliveries'

    def __str__(self):
        return f"{self.notification.title} -> {self.subscription.user.username} ({self.status})"
