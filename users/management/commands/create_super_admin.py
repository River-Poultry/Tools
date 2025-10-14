from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a super admin user for River Poultry system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='superadmin',
            help='Username for the super admin (default: superadmin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@riverpoultry.com',
            help='Email for the super admin (default: admin@riverpoultry.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the super admin (default: admin123)'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Super',
            help='First name for the super admin (default: Super)'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='Admin',
            help='Last name for the super admin (default: Admin)'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        try:
            with transaction.atomic():
                # Check if super admin already exists
                if User.objects.filter(admin_role='super_admin').exists():
                    self.stdout.write(
                        self.style.WARNING('Super admin already exists!')
                    )
                    return

                # Create super admin user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    admin_role='super_admin',
                    is_admin=True,
                    is_staff=True,
                    is_superuser=True,
                    is_verified=True,
                    farm_name='River Poultry Headquarters'
                )
                
                # Set admin permissions
                user.can_manage_users = True
                user.can_manage_operations = True
                user.can_manage_vaccinations = True
                user.can_manage_notifications = True
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created super admin user: {username}'
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
                    self.style.WARNING(
                        'Please change the password after first login!'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating super admin: {str(e)}')
            )
