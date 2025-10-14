from django.contrib import admin
from .models import PushSubscription, NotificationMessage, NotificationDelivery


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'endpoint_short', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__username', 'user__email', 'endpoint']
    readonly_fields = ['created_at', 'updated_at']
    
    def endpoint_short(self, obj):
        return f"{obj.endpoint[:50]}..." if len(obj.endpoint) > 50 else obj.endpoint
    endpoint_short.short_description = 'Endpoint'


@admin.register(NotificationMessage)
class NotificationMessageAdmin(admin.ModelAdmin):
    list_display = ['title', 'message_type', 'status', 'target_summary', 'created_by', 'created_at', 'sent_at']
    list_filter = ['message_type', 'status', 'target_all_users', 'created_at']
    search_fields = ['title', 'body', 'created_by__username']
    readonly_fields = ['created_at', 'updated_at', 'sent_at']
    filter_horizontal = ['target_users']
    
    fieldsets = (
        ('Message Details', {
            'fields': ('title', 'body', 'message_type', 'status')
        }),
        ('Targeting', {
            'fields': ('target_all_users', 'target_users', 'target_experience_level')
        }),
        ('Scheduling', {
            'fields': ('scheduled_for',)
        }),
        ('Additional Data', {
            'fields': ('icon_url', 'action_url', 'extra_data'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at', 'sent_at'),
            'classes': ('collapse',)
        }),
    )
    
    def target_summary(self, obj):
        if obj.target_all_users:
            return "All Users"
        
        parts = []
        if obj.target_users.exists():
            parts.append(f"{obj.target_users.count()} specific users")
        if obj.target_experience_level:
            parts.append(f"{obj.target_experience_level} users")
        
        return ", ".join(parts) if parts else "No targeting"
    target_summary.short_description = 'Target Audience'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by for new objects
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(NotificationDelivery)
class NotificationDeliveryAdmin(admin.ModelAdmin):
    list_display = ['notification_title', 'user', 'status', 'sent_at', 'delivered_at', 'clicked_at']
    list_filter = ['status', 'sent_at', 'delivered_at', 'clicked_at']
    search_fields = ['notification__title', 'subscription__user__username', 'subscription__user__email']
    readonly_fields = ['created_at']
    
    def notification_title(self, obj):
        return obj.notification.title
    notification_title.short_description = 'Notification'
    
    def user(self, obj):
        return obj.subscription.user.username
    user.short_description = 'User'


# Customize admin site header
admin.site.site_header = "River Poultry Admin"
admin.site.site_title = "River Poultry Admin"
admin.site.index_title = "Welcome to River Poultry Administration"

