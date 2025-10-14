from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom User model for River Poultry Tools"""
    
    EXPERIENCE_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('expert', 'Expert'),
    ]
    
    SUBSCRIPTION_PLANS = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise'),
    ]
    
    ADMIN_ROLES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('veterinarian', 'Veterinarian'),
        ('farmer', 'Farmer'),
    ]
    
    # Additional fields
    phone = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    farm_name = models.CharField(max_length=200, blank=True, null=True)
    farm_size = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Farm size in acres/hectares")
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS, default='beginner')
    subscription_plan = models.CharField(max_length=20, choices=SUBSCRIPTION_PLANS, default='free')
    subscription_expires_at = models.DateTimeField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    
    # Admin system fields
    admin_role = models.CharField(max_length=20, choices=ADMIN_ROLES, default='farmer')
    is_admin = models.BooleanField(default=False)
    can_manage_users = models.BooleanField(default=False)
    can_manage_operations = models.BooleanField(default=False)
    can_manage_vaccinations = models.BooleanField(default=False)
    can_manage_notifications = models.BooleanField(default=False)
    
    # Enhanced permission system
    can_view_analytics = models.BooleanField(default=False)
    can_manage_inventory = models.BooleanField(default=False)
    
    # Delete permissions (Super Admin only)
    can_delete_users = models.BooleanField(default=False)
    can_delete_operations = models.BooleanField(default=False)
    can_delete_vaccinations = models.BooleanField(default=False)
    can_delete_analytics = models.BooleanField(default=False)
    can_delete_inventory = models.BooleanField(default=False)
    
    # View restrictions
    can_view_sensitive_data = models.BooleanField(default=False)
    can_export_data = models.BooleanField(default=False)
    can_manage_system_settings = models.BooleanField(default=False)
    
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Fix related_name conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='river_poultry_users',
        related_query_name='river_poultry_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='river_poultry_users',
        related_query_name='river_poultry_user',
    )
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def is_subscription_active(self):
        """Check if user's subscription is active"""
        if self.subscription_plan == 'free':
            return True
        if self.subscription_expires_at:
            return timezone.now() < self.subscription_expires_at
        return False
    
    @property
    def full_name(self):
        """Return the user's full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def has_admin_access(self):
        """Check if user has admin access"""
        return self.is_admin or self.admin_role in ['super_admin', 'admin', 'manager']
    
    def has_super_admin_access(self):
        """Check if user has super admin access"""
        return self.admin_role == 'super_admin'
    
    def has_manage_users_permission(self):
        """Check if user can manage other users"""
        return self.can_manage_users or self.admin_role in ['super_admin', 'admin']
    
    def has_manage_operations_permission(self):
        """Check if user can manage operations"""
        return self.can_manage_operations or self.admin_role in ['super_admin', 'admin', 'manager']
    
    def has_manage_vaccinations_permission(self):
        """Check if user can manage vaccinations"""
        return self.can_manage_vaccinations or self.admin_role in ['super_admin', 'admin', 'manager', 'veterinarian']
    
    def has_manage_notifications_permission(self):
        """Check if user can manage notifications"""
        return self.can_manage_notifications or self.admin_role in ['super_admin', 'admin', 'manager']
    
    def get_role_display(self):
        """Get the display name for the admin role"""
        return dict(self.ADMIN_ROLES).get(self.admin_role, 'Farmer')
    
    def has_permission(self, permission_name):
        """Check if user has specific permission"""
        if self.admin_role == 'super_admin':
            return True
        
        permission_map = {
            'manage_users': self.can_manage_users,
            'manage_operations': self.can_manage_operations,
            'manage_vaccinations': self.can_manage_vaccinations,
            'manage_notifications': self.can_manage_notifications,
            'view_analytics': self.can_view_analytics,
            'manage_inventory': self.can_manage_inventory,
            'delete_users': self.can_delete_users,
            'delete_operations': self.can_delete_operations,
            'delete_vaccinations': self.can_delete_vaccinations,
            'delete_analytics': self.can_delete_analytics,
            'delete_inventory': self.can_delete_inventory,
            'view_sensitive_data': self.can_view_sensitive_data,
            'export_data': self.can_export_data,
            'manage_system_settings': self.can_manage_system_settings,
        }
        
        return permission_map.get(permission_name, False)
    
    def can_delete_model(self, model_name):
        """Check if user can delete records from specific model"""
        if self.admin_role == 'super_admin':
            return True
        
        delete_permissions = {
            'user': self.can_delete_users,
            'poultryoperation': self.can_delete_operations,
            'vaccinationplan': self.can_delete_vaccinations,
            'vaccinationreminder': self.can_delete_vaccinations,
            'frontendanalytics': self.can_delete_analytics,
            'toolusageevent': self.can_delete_analytics,
            'vaccinationsubmission': self.can_delete_analytics,
            'inventoryitem': self.can_delete_inventory,
            'inventorycategory': self.can_delete_inventory,
            'supplier': self.can_delete_inventory,
        }
        
        return delete_permissions.get(model_name.lower(), False)
    
    def get_accessible_models(self):
        """Get list of models user can access"""
        accessible = []
        
        if self.admin_role == 'super_admin':
            return ['all']
        
        if self.can_manage_users:
            accessible.extend(['user', 'userprofile'])
        
        if self.can_manage_operations:
            accessible.extend(['poultryoperation', 'operationmetrics'])
        
        if self.can_manage_vaccinations:
            accessible.extend(['vaccinationplan', 'vaccinationtemplate', 'vaccinationreminder'])
        
        if self.can_view_analytics:
            accessible.extend(['frontendanalytics', 'toolusageevent', 'vaccinationsubmission'])
        
        if self.can_manage_inventory:
            accessible.extend(['inventoryitem', 'inventorycategory', 'supplier', 'inventoryalert', 'inventorytransaction'])
        
        return accessible


class UserProfile(models.Model):
    """Extended user profile information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    notification_preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.full_name}'s Profile"