from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from django.db.models import Count, Q
from .models import PushSubscription, NotificationMessage, NotificationDelivery
from .serializers import (
    PushSubscriptionSerializer, NotificationMessageSerializer, 
    NotificationMessageCreateSerializer, NotificationDeliverySerializer,
    NotificationStatsSerializer
)
from .services import NotificationService
import json


class PushSubscriptionView(generics.CreateAPIView):
    """Handle push subscription registration"""
    serializer_class = PushSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        subscription_data = data.get('subscription', {})
        
        # Create or update subscription
        subscription, created = PushSubscription.objects.get_or_create(
            user=request.user,
            endpoint=subscription_data.get('endpoint'),
            defaults={
                'p256dh_key': subscription_data.get('keys', {}).get('p256dh', ''),
                'auth_key': subscription_data.get('keys', {}).get('auth', ''),
                'is_active': True
            }
        )
        
        if not created:
            # Update existing subscription
            subscription.p256dh_key = subscription_data.get('keys', {}).get('p256dh', '')
            subscription.auth_key = subscription_data.get('keys', {}).get('auth', '')
            subscription.is_active = True
            subscription.save()

        serializer = self.get_serializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unsubscribe_from_notifications(request):
    """Remove user's push subscription"""
    try:
        PushSubscription.objects.filter(user=request.user).update(is_active=False)
        return Response({'message': 'Successfully unsubscribed from notifications'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class NotificationMessageListCreateView(generics.ListCreateAPIView):
    """List and create notification messages (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NotificationMessageCreateSerializer
        return NotificationMessageSerializer
    
    def get_queryset(self):
        return NotificationMessage.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class NotificationMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete notification messages (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = NotificationMessageSerializer
    
    def get_queryset(self):
        return NotificationMessage.objects.all()


@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_notification(request, notification_id):
    """Send a notification message to all target users"""
    try:
        notification = NotificationMessage.objects.get(id=notification_id)
        
        if notification.status == 'sent':
            return Response({'error': 'Notification has already been sent'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get target users
        User = settings.AUTH_USER_MODEL
        target_users = notification.get_target_users()
        
        # Get active subscriptions for target users
        subscriptions = PushSubscription.objects.filter(
            user__in=target_users,
            is_active=True
        )
        
        if not subscriptions.exists():
            return Response({'error': 'No active subscriptions found for target users'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create delivery records
        deliveries = []
        for subscription in subscriptions:
            delivery, created = NotificationDelivery.objects.get_or_create(
                notification=notification,
                subscription=subscription,
                defaults={'status': 'pending'}
            )
            deliveries.append(delivery)
        
        # Send notifications
        notification_service = NotificationService()
        success_count = 0
        failure_count = 0
        
        for delivery in deliveries:
            try:
                # Prepare notification payload
                payload = {
                    'title': notification.title,
                    'body': notification.body,
                    'icon': notification.icon_url or '/river-poultry-logo.png',
                    'data': {
                        'url': notification.action_url or '/',
                        'notification_id': notification.id,
                        'message_type': notification.message_type
                    }
                }
                
                # Send push notification
                success = notification_service.send_push_notification(
                    delivery.subscription,
                    payload
                )
                
                if success:
                    delivery.status = 'sent'
                    delivery.sent_at = timezone.now()
                    success_count += 1
                else:
                    delivery.status = 'failed'
                    delivery.error_message = 'Failed to send notification'
                    failure_count += 1
                
                delivery.save()
                
            except Exception as e:
                delivery.status = 'failed'
                delivery.error_message = str(e)
                delivery.save()
                failure_count += 1
        
        # Update notification status
        notification.status = 'sent'
        notification.sent_at = timezone.now()
        notification.save()
        
        return Response({
            'message': f'Notification sent to {success_count} users',
            'success_count': success_count,
            'failure_count': failure_count
        })
        
    except NotificationMessage.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def notification_stats(request):
    """Get notification statistics"""
    try:
        total_notifications = NotificationMessage.objects.count()
        total_deliveries = NotificationDelivery.objects.count()
        successful_deliveries = NotificationDelivery.objects.filter(status='sent').count()
        failed_deliveries = NotificationDelivery.objects.filter(status='failed').count()
        clicked_deliveries = NotificationDelivery.objects.filter(status='clicked').count()
        
        click_rate = (clicked_deliveries / successful_deliveries * 100) if successful_deliveries > 0 else 0
        delivery_rate = (successful_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0
        
        stats = {
            'total_notifications': total_notifications,
            'total_deliveries': total_deliveries,
            'successful_deliveries': successful_deliveries,
            'failed_deliveries': failed_deliveries,
            'click_rate': round(click_rate, 2),
            'delivery_rate': round(delivery_rate, 2)
        }
        
        serializer = NotificationStatsSerializer(stats)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def notification_deliveries(request, notification_id):
    """Get delivery status for a specific notification"""
    try:
        deliveries = NotificationDelivery.objects.filter(
            notification_id=notification_id
        ).select_related('subscription__user')
        
        serializer = NotificationDeliverySerializer(deliveries, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)