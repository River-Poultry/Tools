from django.db import models
from django.core.validators import MinValueValidator
from operations.models import PoultryOperation


class VaccinationPlan(models.Model):
    """Model for managing vaccination plans"""
    
    ROUTE_CHOICES = [
        ('IM', 'Intramuscular'),
        ('SC', 'Subcutaneous'),
        ('drinking_water', 'Drinking Water'),
        ('spray', 'Spray'),
        ('eye_drop', 'Eye Drop'),
        ('wing_web', 'Wing Web'),
        ('hatchery', 'Hatchery'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('missed', 'Missed'),
        ('rescheduled', 'Rescheduled'),
        ('cancelled', 'Cancelled'),
    ]
    
    operation = models.ForeignKey(PoultryOperation, on_delete=models.CASCADE, related_name='vaccination_plans')
    vaccine_name = models.CharField(max_length=200)
    scheduled_date = models.DateField()
    age_days = models.PositiveIntegerField(help_text="Age of birds in days when vaccination should be given")
    route = models.CharField(max_length=20, choices=ROUTE_CHOICES)
    dosage = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Completion details
    completed_at = models.DateTimeField(blank=True, null=True)
    completed_by = models.CharField(max_length=200, blank=True, null=True)  # veterinarian or farm worker
    actual_dosage_used = models.CharField(max_length=100, blank=True, null=True)
    completion_notes = models.TextField(blank=True, null=True)
    
    # Rescheduling
    rescheduled_from = models.ForeignKey('self', on_delete=models.SET_NULL, blank=True, null=True, related_name='rescheduled_to')
    reschedule_reason = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['scheduled_date', 'age_days']
        verbose_name = 'Vaccination Plan'
        verbose_name_plural = 'Vaccination Plans'
    
    def __str__(self):
        return f"{self.vaccine_name} - {self.operation.operation_name} ({self.scheduled_date})"
    
    @property
    def is_overdue(self):
        """Check if vaccination is overdue"""
        from django.utils import timezone
        today = timezone.now().date()
        return today > self.scheduled_date and self.status == 'scheduled'
    
    @property
    def days_until_due(self):
        """Calculate days until vaccination is due"""
        from django.utils import timezone
        today = timezone.now().date()
        return (self.scheduled_date - today).days
    
    def mark_completed(self, completed_by, actual_dosage=None, notes=None):
        """Mark vaccination as completed"""
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.completed_by = completed_by
        if actual_dosage:
            self.actual_dosage_used = actual_dosage
        if notes:
            self.completion_notes = notes
        self.save()


class VaccinationTemplate(models.Model):
    """Template for standard vaccination schedules by poultry type"""
    
    POULTRY_TYPES = [
        ('broilers', 'Broilers'),
        ('layers', 'Layers'),
        ('sasso_kroilers', 'Sasso/Kroilers'),
        ('local', 'Local'),
    ]
    
    poultry_type = models.CharField(max_length=20, choices=POULTRY_TYPES)
    vaccine_name = models.CharField(max_length=200)
    age_days = models.PositiveIntegerField()
    route = models.CharField(max_length=20, choices=VaccinationPlan.ROUTE_CHOICES)
    dosage = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_required = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['poultry_type', 'age_days']
        unique_together = ['poultry_type', 'vaccine_name', 'age_days']
        verbose_name = 'Vaccination Template'
        verbose_name_plural = 'Vaccination Templates'
    
    def __str__(self):
        return f"{self.poultry_type.title()} - {self.vaccine_name} (Day {self.age_days})"


class VaccinationReminder(models.Model):
    """Model for vaccination reminders and notifications"""
    
    REMINDER_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('whatsapp', 'WhatsApp'),
        ('push', 'Push Notification'),
        ('calendar', 'Calendar'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    vaccination_plan = models.ForeignKey(VaccinationPlan, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPES)
    days_before = models.IntegerField(help_text="Days before vaccination to send reminder (negative for after vaccination)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    
    # Notification details
    recipient_phone = models.CharField(max_length=20, blank=True, null=True)
    recipient_email = models.EmailField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Delivery tracking
    delivery_status = models.CharField(max_length=50, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    retry_count = models.PositiveIntegerField(default=0)
    max_retries = models.PositiveIntegerField(default=3)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Vaccination Reminder'
        verbose_name_plural = 'Vaccination Reminders'
        unique_together = ['vaccination_plan', 'reminder_type', 'days_before']
    
    def __str__(self):
        return f"{self.reminder_type.title()} reminder for {self.vaccination_plan.vaccine_name}"
    
    def mark_sent(self, delivery_status=None):
        """Mark reminder as sent"""
        self.status = 'sent'
        self.is_sent = True
        self.sent_at = timezone.now()
        if delivery_status:
            self.delivery_status = delivery_status
        self.save()
    
    def mark_failed(self, error_message=None):
        """Mark reminder as failed"""
        self.status = 'failed'
        self.retry_count += 1
        if error_message:
            self.error_message = error_message
        self.save()
    
    def can_retry(self):
        """Check if reminder can be retried"""
        return self.retry_count < self.max_retries and self.status == 'failed'
    
    def get_recipient_contact(self):
        """Get the appropriate contact method based on reminder type"""
        if self.reminder_type == 'sms':
            return self.recipient_phone
        elif self.reminder_type == 'whatsapp':
            return self.whatsapp_number
        elif self.reminder_type == 'email':
            return self.recipient_email
        return None