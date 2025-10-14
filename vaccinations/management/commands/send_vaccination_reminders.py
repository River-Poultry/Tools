"""
Management command to send automated vaccination reminders
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from vaccinations.reminder_service import VaccinationReminderService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send automated vaccination reminders and vitamin care notifications'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending notifications',
        )
        parser.add_argument(
            '--vaccination-id',
            type=int,
            help='Send reminders for a specific vaccination plan ID',
        )
        parser.add_argument(
            '--create-schedule',
            action='store_true',
            help='Create reminder schedules for all pending vaccination plans',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Starting vaccination reminder processing...')
        )
        
        reminder_service = VaccinationReminderService()
        
        if options['create_schedule']:
            self.create_reminder_schedules(reminder_service)
        
        if options['vaccination_id']:
            self.process_specific_vaccination(reminder_service, options['vaccination_id'], options['dry_run'])
        else:
            self.process_all_reminders(reminder_service, options['dry_run'])
    
    def create_reminder_schedules(self, reminder_service):
        """Create reminder schedules for all pending vaccination plans"""
        from vaccinations.models import VaccinationPlan
        
        pending_vaccinations = VaccinationPlan.objects.filter(
            status='scheduled',
            scheduled_date__gte=timezone.now().date()
        )
        
        self.stdout.write(f"Creating reminder schedules for {pending_vaccinations.count()} vaccination plans...")
        
        created_count = 0
        for vaccination in pending_vaccinations:
            reminders = reminder_service.create_reminder_schedule(vaccination)
            created_count += len(reminders)
        
        self.stdout.write(
            self.style.SUCCESS(f"Created {created_count} reminder schedules")
        )
    
    def process_specific_vaccination(self, reminder_service, vaccination_id, dry_run):
        """Process reminders for a specific vaccination"""
        from vaccinations.models import VaccinationPlan
        
        try:
            vaccination = VaccinationPlan.objects.get(id=vaccination_id)
            self.stdout.write(f"Processing reminders for vaccination: {vaccination}")
            
            if dry_run:
                self.stdout.write("DRY RUN - Would create reminder schedule")
            else:
                reminders = reminder_service.create_reminder_schedule(vaccination)
                self.stdout.write(f"Created {len(reminders)} reminder schedules")
                
        except VaccinationPlan.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"Vaccination plan with ID {vaccination_id} not found")
            )
    
    def process_all_reminders(self, reminder_service, dry_run):
        """Process all due reminders"""
        if dry_run:
            self.stdout.write("DRY RUN MODE - No notifications will be sent")
            
            # Show what would be processed
            due_reminders = reminder_service.get_due_reminders()
            vitamin_reminders = reminder_service.get_vitamin_care_reminders()
            
            self.stdout.write(f"Would process {len(due_reminders)} vaccination reminders:")
            for reminder in due_reminders:
                self.stdout.write(f"  - {reminder.vaccination_plan.vaccine_name} ({reminder.vaccination_plan.scheduled_date}) - {reminder.get_status_display()}")
            
            self.stdout.write(f"Would process {len(vitamin_reminders)} vitamin care reminders:")
            for reminder_data in vitamin_reminders:
                vaccination = reminder_data['vaccination_plan']
                days_remaining = reminder_data['days_remaining']
                self.stdout.write(f"  - {vaccination.vaccine_name} - {days_remaining} days remaining")
        else:
            # Process all reminders
            summary = reminder_service.process_all_due_reminders()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"Processed reminders:\n"
                    f"  Vaccination reminders sent: {summary['vaccination_reminders_sent']}\n"
                    f"  Vaccination reminders failed: {summary['vaccination_reminders_failed']}\n"
                    f"  Vitamin reminders sent: {summary['vitamin_reminders_sent']}\n"
                    f"  Vitamin reminders failed: {summary['vitamin_reminders_failed']}"
                )
            )
    
    def show_reminder_stats(self, reminder_service):
        """Show statistics about reminders"""
        from vaccinations.models import VaccinationReminder, VaccinationPlan
        
        # Get reminder statistics
        total_reminders = VaccinationReminder.objects.count()
        pending_reminders = VaccinationReminder.objects.filter(status='pending').count()
        sent_reminders = VaccinationReminder.objects.filter(status='sent').count()
        failed_reminders = VaccinationReminder.objects.filter(status='failed').count()
        
        # Get vaccination statistics
        total_vaccinations = VaccinationPlan.objects.count()
        scheduled_vaccinations = VaccinationPlan.objects.filter(status='scheduled').count()
        completed_vaccinations = VaccinationPlan.objects.filter(status='completed').count()
        
        self.stdout.write("\n=== REMINDER STATISTICS ===")
        self.stdout.write(f"Total reminders: {total_reminders}")
        self.stdout.write(f"Pending reminders: {pending_reminders}")
        self.stdout.write(f"Sent reminders: {sent_reminders}")
        self.stdout.write(f"Failed reminders: {failed_reminders}")
        
        self.stdout.write("\n=== VACCINATION STATISTICS ===")
        self.stdout.write(f"Total vaccinations: {total_vaccinations}")
        self.stdout.write(f"Scheduled vaccinations: {scheduled_vaccinations}")
        self.stdout.write(f"Completed vaccinations: {completed_vaccinations}")
        
        # Show upcoming vaccinations
        upcoming_vaccinations = VaccinationPlan.objects.filter(
            status='scheduled',
            scheduled_date__gte=timezone.now().date()
        ).order_by('scheduled_date')[:5]
        
        if upcoming_vaccinations.exists():
            self.stdout.write("\n=== UPCOMING VACCINATIONS (Next 5) ===")
            for vaccination in upcoming_vaccinations:
                self.stdout.write(f"  {vaccination.scheduled_date}: {vaccination.vaccine_name} - {vaccination.operation.operation_name}")
