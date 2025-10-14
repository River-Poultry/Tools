"""
Celery tasks for vaccination reminders
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging
from .services import NotificationService, create_vaccination_reminder_message, create_whatsapp_vaccination_reminder
from vaccinations.models import VaccinationPlan, VaccinationReminder

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_vaccination_reminder(self, reminder_id):
    """Send a single vaccination reminder"""
    try:
        reminder = VaccinationReminder.objects.get(id=reminder_id)
        vaccination_plan = reminder.vaccination_plan
        
        # Get user contact information
        user = vaccination_plan.operation.user
        contact = reminder.get_recipient_contact()
        
        if not contact:
            # Set default contact based on user profile
            if reminder.reminder_type == 'sms':
                contact = user.phone
            elif reminder.reminder_type == 'whatsapp':
                contact = user.phone  # WhatsApp uses phone number
            elif reminder.reminder_type == 'email':
                contact = user.email
        
        if not contact:
            reminder.mark_failed("No contact information available")
            return {"success": False, "error": "No contact information"}
        
        # Create appropriate message
        if reminder.reminder_type == 'whatsapp':
            message = create_whatsapp_vaccination_reminder(vaccination_plan, reminder.days_before)
        else:
            message = create_vaccination_reminder_message(vaccination_plan, reminder.days_before)
        
        # Send the reminder
        notification_service = NotificationService()
        result = notification_service.send_vaccination_reminder(
            reminder.reminder_type,
            contact,
            message
        )
        
        if result['success']:
            reminder.mark_sent(result.get('status', 'sent'))
            logger.info(f"Reminder sent successfully: {reminder}")
            return {"success": True, "reminder_id": reminder_id}
        else:
            reminder.mark_failed(result.get('error', 'Unknown error'))
            logger.error(f"Reminder failed: {result.get('error')}")
            return {"success": False, "error": result.get('error')}
            
    except VaccinationReminder.DoesNotExist:
        logger.error(f"Reminder not found: {reminder_id}")
        return {"success": False, "error": "Reminder not found"}
    except Exception as e:
        logger.error(f"Unexpected error sending reminder {reminder_id}: {str(e)}")
        # Retry the task
        raise self.retry(countdown=60 * (self.request.retries + 1))


@shared_task
def process_daily_reminders():
    """Process all reminders due today"""
    today = timezone.now().date()
    tomorrow = today + timedelta(days=1)
    
    # Find vaccination plans scheduled for tomorrow
    upcoming_vaccinations = VaccinationPlan.objects.filter(
        scheduled_date=tomorrow,
        status='scheduled'
    )
    
    reminders_created = 0
    reminders_sent = 0
    
    for vaccination in upcoming_vaccinations:
        # Create SMS reminder
        sms_reminder, created = VaccinationReminder.objects.get_or_create(
            vaccination_plan=vaccination,
            reminder_type='sms',
            days_before=1,
            defaults={
                'recipient_phone': vaccination.operation.user.phone,
                'message': create_vaccination_reminder_message(vaccination, 1)
            }
        )
        
        if created:
            reminders_created += 1
            # Schedule the reminder to be sent
            send_vaccination_reminder.delay(sms_reminder.id)
        
        # Create WhatsApp reminder
        whatsapp_reminder, created = VaccinationReminder.objects.get_or_create(
            vaccination_plan=vaccination,
            reminder_type='whatsapp',
            days_before=1,
            defaults={
                'whatsapp_number': vaccination.operation.user.phone,
                'message': create_whatsapp_vaccination_reminder(vaccination, 1)
            }
        )
        
        if created:
            reminders_created += 1
            # Schedule the reminder to be sent
            send_vaccination_reminder.delay(whatsapp_reminder.id)
    
    logger.info(f"Processed {reminders_created} new reminders for {upcoming_vaccinations.count()} vaccinations")
    return {
        "reminders_created": reminders_created,
        "vaccinations_processed": upcoming_vaccinations.count()
    }


@shared_task
def retry_failed_reminders():
    """Retry failed reminders that can be retried"""
    failed_reminders = VaccinationReminder.objects.filter(
        status='failed'
    ).exclude(
        retry_count__gte=3  # Don't retry if max retries reached
    )
    
    retried_count = 0
    
    for reminder in failed_reminders:
        if reminder.can_retry():
            # Reset status to pending for retry
            reminder.status = 'pending'
            reminder.save()
            
            # Schedule retry
            send_vaccination_reminder.delay(reminder.id)
            retried_count += 1
    
    logger.info(f"Retried {retried_count} failed reminders")
    return {"retried_count": retried_count}


@shared_task
def send_immediate_reminder(vaccination_plan_id, reminder_types=None):
    """Send immediate reminders for a specific vaccination plan"""
    if reminder_types is None:
        reminder_types = ['sms', 'whatsapp']
    
    try:
        vaccination_plan = VaccinationPlan.objects.get(id=vaccination_plan_id)
        user = vaccination_plan.operation.user
        
        results = []
        
        for reminder_type in reminder_types:
            # Create reminder
            reminder, created = VaccinationReminder.objects.get_or_create(
                vaccination_plan=vaccination_plan,
                reminder_type=reminder_type,
                days_before=0,  # Immediate
                defaults={
                    'recipient_phone': user.phone if reminder_type in ['sms', 'whatsapp'] else None,
                    'recipient_email': user.email if reminder_type == 'email' else None,
                    'whatsapp_number': user.phone if reminder_type == 'whatsapp' else None,
                    'message': create_vaccination_reminder_message(vaccination_plan, 0)
                }
            )
            
            # Send immediately
            result = send_vaccination_reminder.delay(reminder.id)
            results.append({
                'reminder_type': reminder_type,
                'task_id': result.id,
                'reminder_id': reminder.id
            })
        
        return {"success": True, "results": results}
        
    except VaccinationPlan.DoesNotExist:
        return {"success": False, "error": "Vaccination plan not found"}


@shared_task
def cleanup_old_reminders():
    """Clean up old reminders (older than 30 days)"""
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=30)
    
    old_reminders = VaccinationReminder.objects.filter(
        created_at__lt=cutoff_date,
        status__in=['sent', 'failed']
    )
    
    count = old_reminders.count()
    old_reminders.delete()
    
    logger.info(f"Cleaned up {count} old reminders")
    return {"cleaned_count": count}




