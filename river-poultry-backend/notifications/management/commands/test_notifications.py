from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.models import NotificationMessage, PushSubscription
from notifications.services import NotificationService

User = get_user_model()


class Command(BaseCommand):
    help = 'Test the notification system by creating a test notification'

    def add_arguments(self, parser):
        parser.add_argument(
            '--title',
            type=str,
            default='Test Notification',
            help='Title for the test notification'
        )
        parser.add_argument(
            '--body',
            type=str,
            default='This is a test notification from River Poultry Tools!',
            help='Body for the test notification'
        )
        parser.add_argument(
            '--send',
            action='store_true',
            help='Actually send the notification to subscribed users'
        )

    def handle(self, *args, **options):
        title = options['title']
        body = options['body']
        send_notification = options['send']

        self.stdout.write(f'Creating test notification: "{title}"')
        
        # Create a test notification
        notification = NotificationMessage.objects.create(
            title=title,
            body=body,
            message_type='general',
            target_all_users=True,
            status='draft'
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Created notification with ID: {notification.id}')
        )
        
        # Check for active subscriptions
        active_subscriptions = PushSubscription.objects.filter(is_active=True)
        self.stdout.write(f'Found {active_subscriptions.count()} active subscriptions')
        
        if active_subscriptions.exists():
            for subscription in active_subscriptions:
                self.stdout.write(f'  - {subscription.user.username} ({subscription.user.email})')
        
        if send_notification and active_subscriptions.exists():
            self.stdout.write('Sending notification...')
            
            # Send the notification
            notification_service = NotificationService()
            results = notification_service.send_to_all_users({
                'title': title,
                'body': body,
                'icon': '/river-poultry-logo.png',
                'data': {
                    'url': '/',
                    'notification_id': notification.id
                }
            })
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Notification sent! Success: {results["success"]}, Failed: {results["failed"]}'
                )
            )
            
            if results['errors']:
                for error in results['errors']:
                    self.stdout.write(self.style.ERROR(f'Error: {error}'))
        elif send_notification:
            self.stdout.write(
                self.style.WARNING('No active subscriptions found. Cannot send notification.')
            )
        else:
            self.stdout.write(
                'Use --send flag to actually send the notification to subscribed users'
            )

