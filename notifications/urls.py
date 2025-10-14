from django.urls import path
from . import views

urlpatterns = [
    # Push subscription management
    path('subscribe/', views.PushSubscriptionView.as_view(), name='push-subscribe'),
    path('unsubscribe/', views.unsubscribe_from_notifications, name='push-unsubscribe'),
    
    # Notification message management (Admin only)
    path('messages/', views.NotificationMessageListCreateView.as_view(), name='notification-messages'),
    path('messages/<int:pk>/', views.NotificationMessageDetailView.as_view(), name='notification-message-detail'),
    path('messages/<int:notification_id>/send/', views.send_notification, name='send-notification'),
    path('messages/<int:notification_id>/deliveries/', views.notification_deliveries, name='notification-deliveries'),
    
    # Statistics
    path('stats/', views.notification_stats, name='notification-stats'),
]