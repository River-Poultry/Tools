from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages
from django.utils.html import format_html


class PermissionMixin:
    """Mixin to handle role-based permissions in admin"""
    
    def has_module_permission(self, request):
        """Control visibility of modules in the admin sidebar"""
        if not request.user.is_authenticated:
            return False
        
        # Super admin can see everything
        if request.user.admin_role == 'super_admin':
            return True
        
        # Check specific permissions based on model
        model_name = self.model._meta.model_name
        accessible_models = request.user.get_accessible_models()
        
        if 'all' in accessible_models:
            return True
        
        return model_name in accessible_models
    
    def has_view_permission(self, request, obj=None):
        """Check if user can view this model"""
        return self.has_module_permission(request)
    
    def has_add_permission(self, request):
        """Check if user can add records"""
        if not request.user.is_authenticated:
            return False
        
        if request.user.admin_role == 'super_admin':
            return True
        
        # Check specific permissions
        model_name = self.model._meta.model_name
        permission_map = {
            'user': request.user.has_permission('manage_users'),
            'userprofile': request.user.has_permission('manage_users'),
            'poultryoperation': request.user.has_permission('manage_operations'),
            'operationmetrics': request.user.has_permission('manage_operations'),
            'vaccinationplan': request.user.has_permission('manage_vaccinations'),
            'vaccinationtemplate': request.user.has_permission('manage_vaccinations'),
            'vaccinationreminder': request.user.has_permission('manage_vaccinations'),
            'frontendanalytics': request.user.has_permission('view_analytics'),
            'toolusageevent': request.user.has_permission('view_analytics'),
            'vaccinationsubmission': request.user.has_permission('view_analytics'),
            'inventoryitem': request.user.has_permission('manage_inventory'),
            'inventorycategory': request.user.has_permission('manage_inventory'),
            'supplier': request.user.has_permission('manage_inventory'),
            'inventoryalert': request.user.has_permission('manage_inventory'),
            'inventorytransaction': request.user.has_permission('manage_inventory'),
        }
        
        return permission_map.get(model_name, False)
    
    def has_change_permission(self, request, obj=None):
        """Check if user can change records"""
        return self.has_add_permission(request)
    
    def has_delete_permission(self, request, obj=None):
        """Check if user can delete records - Super Admin only"""
        if not request.user.is_authenticated:
            return False
        
        # Only super admin can delete
        if request.user.admin_role == 'super_admin':
            return True
        
        # Check specific delete permissions
        model_name = self.model._meta.model_name
        return request.user.can_delete_model(model_name)
    
    def get_queryset(self, request):
        """Filter queryset based on user permissions"""
        qs = super().get_queryset(request)
        
        # Super admin sees everything
        if request.user.admin_role == 'super_admin':
            return qs
        
        # Filter based on user permissions
        if not request.user.has_permission('view_sensitive_data'):
            # Hide sensitive fields for non-super admins
            pass
        
        return qs


class DeleteRestrictedMixin:
    """Mixin to restrict delete operations to Super Admin only"""
    
    def delete_model(self, request, obj):
        """Override delete to check permissions"""
        if not request.user.can_delete_model(self.model._meta.model_name):
            messages.error(request, "Only Super Administrators can delete records.")
            raise PermissionDenied("Only Super Administrators can delete records.")
        super().delete_model(request, obj)
    
    def delete_queryset(self, request, queryset):
        """Override bulk delete to check permissions"""
        if not request.user.can_delete_model(self.model._meta.model_name):
            messages.error(request, "Only Super Administrators can delete records.")
            raise PermissionDenied("Only Super Administrators can delete records.")
        super().delete_queryset(request, queryset)


class RoleBasedAdminMixin(PermissionMixin, DeleteRestrictedMixin):
    """Combined mixin for role-based admin functionality"""
    
    def get_list_display(self, request):
        """Customize list display based on user role"""
        display = super().get_list_display(request)
        
        # Hide sensitive fields for non-super admins
        if request.user.admin_role != 'super_admin':
            sensitive_fields = ['id', 'created_at', 'updated_at', 'last_login_ip']
            display = [field for field in display if field not in sensitive_fields]
        
        return display
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields readonly based on user role"""
        readonly = super().get_readonly_fields(request, obj)
        
        # Convert tuple to list if needed
        if isinstance(readonly, tuple):
            readonly = list(readonly)
        elif readonly is None:
            readonly = []
        
        # Non-super admins cannot modify certain fields
        if hasattr(request.user, 'admin_role') and request.user.admin_role != 'super_admin':
            readonly.extend(['admin_role', 'is_admin', 'is_superuser', 'is_staff'])
        
        return readonly
    
    def get_exclude(self, request, obj=None):
        """Exclude certain fields based on user role"""
        exclude = super().get_exclude(request, obj)
        
        # Hide sensitive fields for non-super admins
        if request.user.admin_role != 'super_admin':
            sensitive_fields = ['last_login_ip', 'date_joined', 'last_login']
            if exclude:
                exclude.extend(sensitive_fields)
            else:
                exclude = sensitive_fields
        
        return exclude


class UserRoleFilter(admin.SimpleListFilter):
    """Filter users by admin role"""
    title = 'Admin Role'
    parameter_name = 'admin_role'
    
    def lookups(self, request, model_admin):
        return [
            ('super_admin', 'Super Admin'),
            ('admin', 'Admin'),
            ('manager', 'Manager'),
            ('veterinarian', 'Veterinarian'),
            ('farmer', 'Farmer'),
        ]
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(admin_role=self.value())
        return queryset


class PermissionFilter(admin.SimpleListFilter):
    """Filter users by specific permissions"""
    title = 'Permissions'
    parameter_name = 'permission'
    
    def lookups(self, request, model_admin):
        return [
            ('can_manage_users', 'Can Manage Users'),
            ('can_manage_operations', 'Can Manage Operations'),
            ('can_manage_vaccinations', 'Can Manage Vaccinations'),
            ('can_view_analytics', 'Can View Analytics'),
            ('can_manage_inventory', 'Can Manage Inventory'),
        ]
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(**{self.value(): True})
        return queryset

