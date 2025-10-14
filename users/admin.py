from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import path
from django.shortcuts import redirect
from django.utils.html import format_html
from .models import User, UserProfile
from .admin_views import admin_dashboard
from .admin_mixins import RoleBasedAdminMixin, UserRoleFilter, PermissionFilter

# Register models with default Django admin site
@admin.register(User)
class CustomUserAdmin(RoleBasedAdminMixin, UserAdmin):
    """Custom admin for User model with role-based permissions"""
    list_display = ('username', 'email', 'full_name', 'admin_role', 'is_active', 'is_verified', 'created_at', 'permission_summary')
    list_filter = (UserRoleFilter, PermissionFilter, 'is_active', 'is_staff', 'is_superuser', 'is_verified', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'farm_name')
    ordering = ('-created_at',)
    
    def permission_summary(self, obj):
        """Display a summary of user permissions"""
        if obj.admin_role == 'super_admin':
            return format_html('<span style="color: #dc3545; font-weight: bold;">Super Admin</span>')
        
        permissions = []
        if obj.can_manage_users:
            permissions.append('Users')
        if obj.can_manage_operations:
            permissions.append('Operations')
        if obj.can_manage_vaccinations:
            permissions.append('Vaccinations')
        if obj.can_view_analytics:
            permissions.append('Analytics')
        if obj.can_manage_inventory:
            permissions.append('Inventory')
        
        if permissions:
            return ', '.join(permissions)
        return 'Viewer'
    
    permission_summary.short_description = 'Permissions'
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Farm Information', {'fields': ('phone', 'country', 'region', 'farm_name', 'farm_size', 'experience_level')}),
        ('Admin System', {'fields': ('admin_role', 'is_admin', 'can_manage_users', 'can_manage_operations', 'can_manage_vaccinations', 'can_manage_notifications', 'can_view_analytics', 'can_manage_inventory')}),
        ('Delete Permissions', {'fields': ('can_delete_users', 'can_delete_operations', 'can_delete_vaccinations', 'can_delete_analytics', 'can_delete_inventory')}),
        ('Advanced Permissions', {'fields': ('can_view_sensitive_data', 'can_export_data', 'can_manage_system_settings')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Subscription', {'fields': ('subscription_plan', 'subscription_expires_at', 'is_verified')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'last_login_ip')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
        ('Farm Information', {
            'classes': ('wide',),
            'fields': ('phone', 'country', 'region', 'farm_name', 'farm_size', 'experience_level'),
        }),
        ('Admin System', {
            'classes': ('wide',),
            'fields': ('admin_role', 'is_admin', 'can_manage_users', 'can_manage_operations', 'can_manage_vaccinations', 'can_manage_notifications', 'can_view_analytics', 'can_manage_inventory'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login_ip')
    
    def get_queryset(self, request):
        """Filter users based on admin permissions"""
        qs = super().get_queryset(request)
        if request.user.has_super_admin_access():
            return qs
        elif request.user.has_manage_users_permission():
            return qs.exclude(admin_role='super_admin')
        else:
            return qs.filter(id=request.user.id)
    
    def has_change_permission(self, request, obj=None):
        """Check if user can change other users"""
        if obj is None:
            return request.user.has_manage_users_permission()
        if request.user.has_super_admin_access():
            return True
        if request.user.has_manage_users_permission():
            return obj.admin_role != 'super_admin'
        return obj == request.user
    
    def has_delete_permission(self, request, obj=None):
        """Check if user can delete other users"""
        if obj is None:
            return request.user.has_super_admin_access()
        if request.user.has_super_admin_access():
            return True
        return False


@admin.register(UserProfile)
class UserProfileAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for UserProfile model"""
    list_display = ('user', 'location', 'timezone', 'language', 'created_at')
    list_filter = ('timezone', 'language', 'created_at')
    search_fields = ('user__username', 'user__email', 'location')
    raw_id_fields = ('user',)


# Override the admin site's index method to use our custom dashboard
def custom_admin_index(request, extra_context=None):
    """Custom admin index that redirects to our dashboard"""
    return admin_dashboard(request)

# Monkey patch the admin site's index method
admin.site.index = custom_admin_index
