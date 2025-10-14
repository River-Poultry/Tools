"""
Django management command to process daily reminders
"""
from django.core.management.base import BaseCommand
from notifications.tasks import process_daily_reminders, retry_failed_reminders, cleanup_old_reminders


class Command(BaseCommand):
    help = 'Process daily vaccination reminders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--retry-failed',
            action='store_true',
            help='Retry failed reminders',
        )
        parser.add_argument(
            '--cleanup',
            action='store_true',
            help='Clean up old reminders',
        )

    def handle(self, *args, **options):
        self.stdout.write('Processing daily reminders...')
        
        # Process daily reminders
        result = process_daily_reminders.delay()
        self.stdout.write(
            self.style.SUCCESS(f'Daily reminders task scheduled: {result.id}')
        )
        
        # Retry failed reminders if requested
        if options['retry_failed']:
            retry_result = retry_failed_reminders.delay()
            self.stdout.write(
                self.style.SUCCESS(f'Failed reminders retry task scheduled: {retry_result.id}')
            )
        
        # Cleanup old reminders if requested
        if options['cleanup']:
            cleanup_result = cleanup_old_reminders.delay()
            self.stdout.write(
                self.style.SUCCESS(f'Cleanup task scheduled: {cleanup_result.id}')
            )
        
        self.stdout.write(
            self.style.SUCCESS('Reminder processing completed successfully!')
        )




