from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create admin users with different roles for River Poultry system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--role',
            type=str,
            choices=['admin', 'manager', 'veterinarian'],
            required=True,
            help='Admin role to create (admin, manager, veterinarian)'
        )
        parser.add_argument(
            '--username',
            type=str,
            required=True,
            help='Username for the admin user'
        )
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email for the admin user'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the admin user (default: admin123)'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            required=True,
            help='First name for the admin user'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            required=True,
            help='Last name for the admin user'
        )
        parser.add_argument(
            '--farm-name',
            type=str,
            default='',
            help='Farm name for the admin user'
        )

    def handle(self, *args, **options):
        role = options['role']
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        farm_name = options['farm_name'] or f"{first_name} {last_name}'s Farm"

        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(username=username).exists():
                    self.stdout.write(
                        self.style.ERROR(f'User with username "{username}" already exists!')
                    )
                    return

                # Create admin user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    admin_role=role,
                    is_admin=True,
                    is_staff=True,
                    farm_name=farm_name,
                    is_verified=True
                )
                
                # Set role-specific permissions
                if role == 'admin':
                    user.can_manage_users = True
                    user.can_manage_operations = True
                    user.can_manage_vaccinations = True
                    user.can_manage_notifications = True
                elif role == 'manager':
                    user.can_manage_operations = True
                    user.can_manage_vaccinations = True
                    user.can_manage_notifications = True
                elif role == 'veterinarian':
                    user.can_manage_vaccinations = True
                    user.can_manage_notifications = True
                
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created {role} user: {username}'
                    )
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Email: {email}'
                    )
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Password: {password}'
                    )
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Role: {role.title()}'
                    )
                )
                self.stdout.write(
                    self.style.WARNING(
                        'Please change the password after first login!'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating {role} user: {str(e)}')
            )

