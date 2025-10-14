from rest_framework import serializers
from django.conf import settings
from .models import PushSubscription, NotificationMessage, NotificationDelivery


class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ['id', 'endpoint', 'p256dh_key', 'auth_key', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class NotificationMessageSerializer(serializers.ModelSerializer):
    target_users_count = serializers.SerializerMethodField()
    deliveries_count = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = NotificationMessage
        fields = [
            'id', 'title', 'body', 'message_type', 'status',
            'target_all_users', 'target_users', 'target_experience_level',
            'scheduled_for', 'sent_at', 'icon_url', 'action_url', 'extra_data',
            'created_by', 'created_by_username', 'created_at', 'updated_at',
            'target_users_count', 'deliveries_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'sent_at', 'target_users_count', 'deliveries_count']

    def get_target_users_count(self, obj):
        return obj.get_target_users().count()

    def get_deliveries_count(self, obj):
        return obj.deliveries.count()


class NotificationMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationMessage
        fields = [
            'title', 'body', 'message_type', 'target_all_users',
            'target_users', 'target_experience_level', 'scheduled_for',
            'icon_url', 'action_url', 'extra_data'
        ]

    def validate(self, data):
        # Ensure at least one targeting option is selected
        if not data.get('target_all_users') and not data.get('target_users') and not data.get('target_experience_level'):
            raise serializers.ValidationError(
                "You must select at least one targeting option: all users, specific users, or experience level."
            )
        return data


class NotificationDeliverySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='subscription.user.username', read_only=True)
    user_email = serializers.CharField(source='subscription.user.email', read_only=True)

    class Meta:
        model = NotificationDelivery
        fields = [
            'id', 'status', 'sent_at', 'delivered_at', 'clicked_at',
            'error_message', 'created_at', 'user_username', 'user_email'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationStatsSerializer(serializers.Serializer):
    total_notifications = serializers.IntegerField()
    total_deliveries = serializers.IntegerField()
    successful_deliveries = serializers.IntegerField()
    failed_deliveries = serializers.IntegerField()
    click_rate = serializers.FloatField()
    delivery_rate = serializers.FloatField()