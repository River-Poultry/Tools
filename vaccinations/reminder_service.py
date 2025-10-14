"""
Automated vaccination reminder service
"""

from django.utils import timezone
from django.db.models import Q
from datetime import timedelta, date
from typing import List, Dict, Optional
import logging

from .models import VaccinationPlan, VaccinationReminder
from .notification_templates import get_vaccination_reminder_template, get_vitamin_care_template
from notifications.models import NotificationMessage, PushSubscription
from notifications.services import send_push_notification

logger = logging.getLogger(__name__)


class VaccinationReminderService:
    """Service for managing automated vaccination reminders"""
    
    def __init__(self):
        self.today = timezone.now().date()
    
    def create_reminder_schedule(self, vaccination_plan: VaccinationPlan) -> List[VaccinationReminder]:
        """
        Create reminder schedule for a vaccination plan
        
        Args:
            vaccination_plan (VaccinationPlan): The vaccination plan to create reminders for
            
        Returns:
            List[VaccinationReminder]: Created reminder instances
        """
        reminders = []
        
        # Create reminders for different time periods
        reminder_configs = [
            {'days_before': 1, 'reminder_type': 'day_before'},
            {'days_before': 0, 'reminder_type': 'day_of'},
            {'days_before': -1, 'reminder_type': 'day_after'},  # Day after vaccination
        ]
        
        for config in reminder_configs:
            reminder, created = VaccinationReminder.objects.get_or_create(
                vaccination_plan=vaccination_plan,
                reminder_type='push',
                days_before=config['days_before'],
                defaults={
                    'status': 'pending',
                    'message': f"{config['reminder_type'].replace('_', ' ').title()} reminder for {vaccination_plan.vaccine_name}"
                }
            )
            
            if created:
                reminders.append(reminder)
                logger.info(f"Created {config['reminder_type']} reminder for vaccination {vaccination_plan.id}")
        
        return reminders
    
    def get_due_reminders(self) -> List[VaccinationReminder]:
        """
        Get all reminders that are due to be sent today
        
        Returns:
            List[VaccinationReminder]: Reminders due today
        """
        # Calculate the dates for different reminder types
        day_before_date = self.today + timedelta(days=1)  # Vaccinations tomorrow
        day_of_date = self.today  # Vaccinations today
        day_after_date = self.today - timedelta(days=1)  # Vaccinations yesterday
        
        due_reminders = VaccinationReminder.objects.filter(
            Q(
                vaccination_plan__scheduled_date=day_before_date,
                days_before=1,
                status='pending'
            ) |
            Q(
                vaccination_plan__scheduled_date=day_of_date,
                days_before=0,
                status='pending'
            ) |
            Q(
                vaccination_plan__scheduled_date=day_after_date,
                days_before=-1,
                status='pending'
            )
        ).select_related('vaccination_plan', 'vaccination_plan__operation')
        
        return list(due_reminders)
    
    def get_vitamin_care_reminders(self) -> List[Dict]:
        """
        Get reminders for vitamin care (3-5 days after vaccination)
        
        Returns:
            List[Dict]: Vitamin care reminder data
        """
        # Get vaccinations completed 1-5 days ago
        start_date = self.today - timedelta(days=5)
        end_date = self.today - timedelta(days=1)
        
        completed_vaccinations = VaccinationPlan.objects.filter(
            scheduled_date__range=[start_date, end_date],
            status='completed'
        ).select_related('operation')
        
        vitamin_reminders = []
        
        for vaccination in completed_vaccinations:
            days_since_vaccination = (self.today - vaccination.scheduled_date).days
            
            # Send reminders for days 2, 3, 4, and 5 after vaccination
            if days_since_vaccination in [2, 3, 4, 5]:
                days_remaining = 6 - days_since_vaccination  # Total 5 days of vitamin care
                
                reminder_data = {
                    'vaccination_plan': vaccination,
                    'days_remaining': days_remaining,
                    'days_since_vaccination': days_since_vaccination
                }
                vitamin_reminders.append(reminder_data)
        
        return vitamin_reminders
    
    def send_reminder(self, reminder: VaccinationReminder) -> bool:
        """
        Send a vaccination reminder notification
        
        Args:
            reminder (VaccinationReminder): The reminder to send
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            vaccination_plan = reminder.vaccination_plan
            operation = vaccination_plan.operation
            
            # Determine reminder type based on days_before
            if reminder.days_before == 1:
                reminder_type = 'day_before'
            elif reminder.days_before == 0:
                reminder_type = 'day_of'
            elif reminder.days_before == -1:
                reminder_type = 'day_after'
            else:
                logger.error(f"Invalid reminder type for reminder {reminder.id}")
                return False
            
            # Get notification template
            notification_data = get_vaccination_reminder_template(reminder_type, vaccination_plan)
            if not notification_data:
                logger.error(f"Could not get template for reminder type {reminder_type}")
                return False
            
            # Get user from operation (assuming operation has a user field)
            user = getattr(operation, 'user', None)
            if not user:
                logger.error(f"No user found for operation {operation.id}")
                return False
            
            # Create notification message
            notification_message = NotificationMessage.objects.create(
                title=notification_data['title'],
                body=notification_data['body'],
                message_type=notification_data['message_type'],
                status='sent',
                target_all_users=False,
                icon_url=notification_data.get('icon_url'),
                action_url=notification_data.get('action_url'),
                extra_data=notification_data.get('extra_data', {}),
                created_by=user,
                sent_at=timezone.now()
            )
            
            # Add user to target users
            notification_message.target_users.add(user)
            
            # Send push notification
            success = self._send_push_notification(user, notification_data)
            
            if success:
                reminder.mark_sent('delivered')
                logger.info(f"Successfully sent reminder {reminder.id} to user {user.id}")
            else:
                reminder.mark_failed('Failed to send push notification')
                logger.error(f"Failed to send reminder {reminder.id} to user {user.id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending reminder {reminder.id}: {str(e)}")
            reminder.mark_failed(str(e))
            return False
    
    def send_vitamin_care_reminder(self, reminder_data: Dict) -> bool:
        """
        Send vitamin care reminder
        
        Args:
            reminder_data (Dict): Vitamin care reminder data
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            vaccination_plan = reminder_data['vaccination_plan']
            days_remaining = reminder_data['days_remaining']
            operation = vaccination_plan.operation
            
            # Get user from operation
            user = getattr(operation, 'user', None)
            if not user:
                logger.error(f"No user found for operation {operation.id}")
                return False
            
            # Get notification template
            notification_data = get_vitamin_care_template(vaccination_plan, days_remaining)
            
            # Create notification message
            notification_message = NotificationMessage.objects.create(
                title=notification_data['title'],
                body=notification_data['body'],
                message_type=notification_data['message_type'],
                status='sent',
                target_all_users=False,
                icon_url=notification_data.get('icon_url'),
                action_url=notification_data.get('action_url'),
                extra_data=notification_data.get('extra_data', {}),
                created_by=user,
                sent_at=timezone.now()
            )
            
            # Add user to target users
            notification_message.target_users.add(user)
            
            # Send push notification
            success = self._send_push_notification(user, notification_data)
            
            if success:
                logger.info(f"Successfully sent vitamin care reminder for vaccination {vaccination_plan.id}")
            else:
                logger.error(f"Failed to send vitamin care reminder for vaccination {vaccination_plan.id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending vitamin care reminder: {str(e)}")
            return False
    
    def _send_push_notification(self, user, notification_data: Dict) -> bool:
        """
        Send push notification to user
        
        Args:
            user: User to send notification to
            notification_data (Dict): Notification data
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            # Get user's push subscriptions
            subscriptions = PushSubscription.objects.filter(
                user=user,
                is_active=True
            )
            
            if not subscriptions.exists():
                logger.warning(f"No active push subscriptions found for user {user.id}")
                return False
            
            # Send to all active subscriptions
            success_count = 0
            for subscription in subscriptions:
                try:
                    send_push_notification(
                        subscription=subscription,
                        title=notification_data['title'],
                        body=notification_data['body'],
                        icon_url=notification_data.get('icon_url'),
                        action_url=notification_data.get('action_url'),
                        extra_data=notification_data.get('extra_data', {})
                    )
                    success_count += 1
                except Exception as e:
                    logger.error(f"Failed to send to subscription {subscription.id}: {str(e)}")
            
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error in _send_push_notification: {str(e)}")
            return False
    
    def process_all_due_reminders(self) -> Dict[str, int]:
        """
        Process all due reminders and vitamin care reminders
        
        Returns:
            Dict[str, int]: Summary of processed reminders
        """
        summary = {
            'vaccination_reminders_sent': 0,
            'vaccination_reminders_failed': 0,
            'vitamin_reminders_sent': 0,
            'vitamin_reminders_failed': 0,
        }
        
        # Process vaccination reminders
        due_reminders = self.get_due_reminders()
        for reminder in due_reminders:
            if self.send_reminder(reminder):
                summary['vaccination_reminders_sent'] += 1
            else:
                summary['vaccination_reminders_failed'] += 1
        
        # Process vitamin care reminders
        vitamin_reminders = self.get_vitamin_care_reminders()
        for reminder_data in vitamin_reminders:
            if self.send_vitamin_care_reminder(reminder_data):
                summary['vitamin_reminders_sent'] += 1
            else:
                summary['vitamin_reminders_failed'] += 1
        
        logger.info(f"Processed reminders: {summary}")
        return summary
