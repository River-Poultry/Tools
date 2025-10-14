from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from analytics.models import ToolUsageEvent, VaccinationSubmission
from operations.models import PoultryOperation
from django.db.models import Q

User = get_user_model()


class Command(BaseCommand):
    help = 'Link existing anonymous data to user accounts'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='Username to link data to'
        )
        parser.add_argument(
            '--session-id',
            type=str,
            help='Session ID to link to user'
        )
        parser.add_argument(
            '--farmer-name',
            type=str,
            help='Farmer name to match and link'
        )
        parser.add_argument(
            '--farmer-email',
            type=str,
            help='Farmer email to match and link'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be linked without making changes'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data linking process...'))

        username = options.get('username')
        session_id = options.get('session_id')
        farmer_name = options.get('farmer_name')
        farmer_email = options.get('farmer_email')
        dry_run = options.get('dry_run', False)

        if not username:
            self.stdout.write(self.style.ERROR('Username is required'))
            return

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {username} not found'))
            return

        self.stdout.write(f'Linking data to user: {user.username} ({user.email})')

        linked_count = 0

        # Link tool usage events by session ID
        if session_id:
            events = ToolUsageEvent.objects.filter(
                session_id=session_id,
                user__isnull=True
            )
            if events.exists():
                self.stdout.write(f'Found {events.count()} tool usage events for session {session_id}')
                if not dry_run:
                    events.update(user=user)
                    linked_count += events.count()
                    self.stdout.write(f'Linked {events.count()} tool usage events')
                else:
                    self.stdout.write(f'Would link {events.count()} tool usage events')

        # Link vaccination submissions by farmer name or email
        if farmer_name or farmer_email:
            submissions_query = Q()
            if farmer_name:
                submissions_query |= Q(farmer_name__icontains=farmer_name)
            if farmer_email:
                submissions_query |= Q(farmer_email=farmer_email)
            
            submissions = VaccinationSubmission.objects.filter(
                submissions_query,
                user__isnull=True
            )
            
            if submissions.exists():
                self.stdout.write(f'Found {submissions.count()} vaccination submissions')
                if not dry_run:
                    submissions.update(user=user)
                    linked_count += submissions.count()
                    self.stdout.write(f'Linked {submissions.count()} vaccination submissions')
                else:
                    self.stdout.write(f'Would link {submissions.count()} vaccination submissions')

        # Link poultry operations that might belong to this user
        # (This is more complex as we need to match by various criteria)
        if farmer_name:
            operations = PoultryOperation.objects.filter(
                Q(operation_name__icontains=farmer_name) |
                Q(batch_name__icontains=farmer_name),
                user__isnull=True
            )
            
            if operations.exists():
                self.stdout.write(f'Found {operations.count()} potential poultry operations')
                if not dry_run:
                    operations.update(user=user)
                    linked_count += operations.count()
                    self.stdout.write(f'Linked {operations.count()} poultry operations')
                else:
                    self.stdout.write(f'Would link {operations.count()} poultry operations')

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No changes made'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully linked {linked_count} records to user {username}')
            )

        # Show summary of user's data
        self.stdout.write('\n=== USER DATA SUMMARY ===')
        user_events = ToolUsageEvent.objects.filter(user=user).count()
        user_submissions = VaccinationSubmission.objects.filter(user=user).count()
        user_operations = PoultryOperation.objects.filter(user=user).count()
        
        self.stdout.write(f'Tool usage events: {user_events}')
        self.stdout.write(f'Vaccination submissions: {user_submissions}')
        self.stdout.write(f'Poultry operations: {user_operations}')




