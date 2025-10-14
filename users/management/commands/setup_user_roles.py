from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up different user roles with appropriate permissions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--role',
            type=str,
            choices=['super_admin', 'admin', 'manager', 'veterinarian', 'viewer'],
            help='Role to create user with'
        )
        parser.add_argument(
            '--username',
            type=str,
            default='',
            help='Username for the new user'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='',
            help='Email for the new user'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the new user'
        )

    def handle(self, *args, **options):
        role = options['role']
        username = options['username'] or f'{role}_user'
        email = options['email'] or f'{role}@riverpoultry.com'
        password = options['password']

        with transaction.atomic():
            # Create or update user
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': role.title().replace('_', ' '),
                    'last_name': 'User',
                    'is_admin': True,
                    'is_staff': True,
                    'is_active': True,
                }
            )

            if created:
                user.set_password(password)
                self.stdout.write(
                    self.style.SUCCESS(f'Created {role} user: {username}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User {username} already exists, updating permissions...')
                )

            # Set role and permissions based on role
            user.admin_role = role
            
            if role == 'super_admin':
                user.is_superuser = True
                user.is_staff = True
                user.is_admin = True
                # All permissions
                user.can_manage_users = True
                user.can_manage_operations = True
                user.can_manage_vaccinations = True
                user.can_manage_notifications = True
                user.can_view_analytics = True
                user.can_manage_inventory = True
                # Delete permissions
                user.can_delete_users = True
                user.can_delete_operations = True
                user.can_delete_vaccinations = True
                user.can_delete_analytics = True
                user.can_delete_inventory = True
                # Advanced permissions
                user.can_view_sensitive_data = True
                user.can_export_data = True
                user.can_manage_system_settings = True
                
            elif role == 'admin':
                user.is_superuser = False
                user.is_staff = True
                user.is_admin = True
                # Management permissions
                user.can_manage_users = True
                user.can_manage_operations = True
                user.can_manage_vaccinations = True
                user.can_manage_notifications = True
                user.can_view_analytics = True
                user.can_manage_inventory = True
                # No delete permissions
                user.can_delete_users = False
                user.can_delete_operations = False
                user.can_delete_vaccinations = False
                user.can_delete_analytics = False
                user.can_delete_inventory = False
                # Limited advanced permissions
                user.can_view_sensitive_data = True
                user.can_export_data = True
                user.can_manage_system_settings = False
                
            elif role == 'manager':
                user.is_superuser = False
                user.is_staff = True
                user.is_admin = True
                # Limited management permissions
                user.can_manage_users = False
                user.can_manage_operations = True
                user.can_manage_vaccinations = True
                user.can_manage_notifications = True
                user.can_view_analytics = True
                user.can_manage_inventory = True
                # No delete permissions
                user.can_delete_users = False
                user.can_delete_operations = False
                user.can_delete_vaccinations = False
                user.can_delete_analytics = False
                user.can_delete_inventory = False
                # Limited advanced permissions
                user.can_view_sensitive_data = False
                user.can_export_data = False
                user.can_manage_system_settings = False
                
            elif role == 'veterinarian':
                user.is_superuser = False
                user.is_staff = True
                user.is_admin = True
                # Veterinarian-specific permissions
                user.can_manage_users = False
                user.can_manage_operations = False
                user.can_manage_vaccinations = True
                user.can_manage_notifications = True
                user.can_view_analytics = True
                user.can_manage_inventory = False
                # No delete permissions
                user.can_delete_users = False
                user.can_delete_operations = False
                user.can_delete_vaccinations = False
                user.can_delete_analytics = False
                user.can_delete_inventory = False
                # Limited advanced permissions
                user.can_view_sensitive_data = False
                user.can_export_data = False
                user.can_manage_system_settings = False
                
            elif role == 'viewer':
                user.is_superuser = False
                user.is_staff = True
                user.is_admin = True
                # Read-only permissions
                user.can_manage_users = False
                user.can_manage_operations = False
                user.can_manage_vaccinations = False
                user.can_manage_notifications = False
                user.can_view_analytics = True
                user.can_manage_inventory = False
                # No delete permissions
                user.can_delete_users = False
                user.can_delete_operations = False
                user.can_delete_vaccinations = False
                user.can_delete_analytics = False
                user.can_delete_inventory = False
                # No advanced permissions
                user.can_view_sensitive_data = False
                user.can_export_data = False
                user.can_manage_system_settings = False

            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully set up {role} user: {username} ({email})\n'
                    f'Password: {password}\n'
                    f'Permissions: {self.get_permission_summary(user)}'
                )
            )

    def get_permission_summary(self, user):
        """Get a summary of user permissions"""
        permissions = []
        
        if user.can_manage_users:
            permissions.append('Manage Users')
        if user.can_manage_operations:
            permissions.append('Manage Operations')
        if user.can_manage_vaccinations:
            permissions.append('Manage Vaccinations')
        if user.can_manage_notifications:
            permissions.append('Manage Notifications')
        if user.can_view_analytics:
            permissions.append('View Analytics')
        if user.can_manage_inventory:
            permissions.append('Manage Inventory')
        if user.can_delete_users or user.can_delete_operations or user.can_delete_vaccinations or user.can_delete_analytics or user.can_delete_inventory:
            permissions.append('Delete Records')
        if user.can_view_sensitive_data:
            permissions.append('View Sensitive Data')
        if user.can_export_data:
            permissions.append('Export Data')
        if user.can_manage_system_settings:
            permissions.append('System Settings')
            
        return ', '.join(permissions) if permissions else 'View Only'


