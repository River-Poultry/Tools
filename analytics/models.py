from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()


class ToolUsageEvent(models.Model):
    """Track tool usage events from the frontend"""
    id = models.CharField(max_length=100, primary_key=True)
    tool_name = models.CharField(max_length=50, choices=[
        ('vaccination', 'Vaccination Scheduler'),
        ('roomMeasurement', 'Room Measurement'),
        ('budgetCalculator', 'Budget Calculator'),
        ('pdfDownloader', 'PDF Downloader'),
    ])
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100)
    timestamp = models.DateTimeField(default=timezone.now)
    action = models.CharField(max_length=20, choices=[
        ('view', 'View'),
        ('calculate', 'Calculate'),
        ('download', 'Download'),
        ('export', 'Export'),
        ('calendar_add', 'Add to Calendar'),
        ('email_send', 'Email Send'),
    ])
    metadata = models.JSONField(default=dict, blank=True)
    
    # Location data
    country = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=50, blank=True)
    
    # Device data
    device_type = models.CharField(max_length=20, choices=[
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
        ('desktop', 'Desktop'),
    ], blank=True)
    os = models.CharField(max_length=50, blank=True)
    browser = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['tool_name', 'timestamp']),
            models.Index(fields=['country', 'timestamp']),
            models.Index(fields=['device_type', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['session_id']),
        ]

    def __str__(self):
        return f"{self.tool_name} - {self.action} ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"


class VaccinationSubmission(models.Model):
    """Store vaccination schedule submissions from frontend"""
    id = models.CharField(max_length=100, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100)
    
    # Poultry operation details
    poultry_type = models.CharField(max_length=50, choices=[
        ('broilers', 'Broilers'),
        ('layers', 'Layers / Pullets'),
        ('sasso/kroilers', 'Sasso / Kroilers'),
    ])
    arrival_date = models.DateField()
    batch_name = models.CharField(max_length=100, default='Batch 1')
    batch_size = models.PositiveIntegerField(default=1000)
    
    # Vaccination schedule data
    vaccination_schedule = models.JSONField(default=list)
    total_vaccinations = models.PositiveIntegerField(default=0)
    estimated_sale_date = models.DateField()
    
    # Location and contact info
    farmer_name = models.CharField(max_length=200, blank=True)
    farmer_email = models.EmailField(blank=True)
    farmer_phone = models.CharField(max_length=20, blank=True)
    farm_location = models.CharField(max_length=200, blank=True)
    
    # Analytics
    country = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    device_type = models.CharField(max_length=20, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('submitted', 'Submitted'),
        ('processed', 'Processed'),
        ('assigned_vet', 'Veterinarian Assigned'),
        ('completed', 'Completed'),
    ], default='submitted')
    
    # Veterinarian assignment
    assigned_veterinarian = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_vaccinations',
        limit_choices_to={'admin_role': 'veterinarian'}
    )
    assignment_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['poultry_type', 'arrival_date']),
            models.Index(fields=['status']),
            models.Index(fields=['country']),
            models.Index(fields=['assigned_veterinarian']),
        ]

    def __str__(self):
        return f"{self.poultry_type.title()} - {self.batch_name} ({self.arrival_date})"

    @property
    def days_until_arrival(self):
        """Calculate days until chick arrival"""
        today = timezone.now().date()
        return (self.arrival_date - today).days

    @property
    def is_upcoming(self):
        """Check if arrival is within next 30 days"""
        return 0 <= self.days_until_arrival <= 30

    @property
    def is_overdue(self):
        """Check if arrival date has passed"""
        return self.days_until_arrival < 0


class FrontendAnalytics(models.Model):
    """Aggregated analytics data from frontend"""
    date = models.DateField(unique=True)
    
    # Usage statistics
    total_users = models.PositiveIntegerField(default=0)
    total_sessions = models.PositiveIntegerField(default=0)
    total_page_views = models.PositiveIntegerField(default=0)
    
    # Tool usage
    vaccination_usage = models.PositiveIntegerField(default=0)
    room_measurement_usage = models.PositiveIntegerField(default=0)
    budget_calculator_usage = models.PositiveIntegerField(default=0)
    pdf_downloads = models.PositiveIntegerField(default=0)
    calendar_integrations = models.PositiveIntegerField(default=0)
    
    # Poultry type popularity
    broilers_count = models.PositiveIntegerField(default=0)
    layers_count = models.PositiveIntegerField(default=0)
    sasso_kroilers_count = models.PositiveIntegerField(default=0)
    
    # Geographic data
    top_countries = models.JSONField(default=list, blank=True)
    top_regions = models.JSONField(default=list, blank=True)
    
    # Device statistics
    mobile_usage = models.PositiveIntegerField(default=0)
    tablet_usage = models.PositiveIntegerField(default=0)
    desktop_usage = models.PositiveIntegerField(default=0)
    
    # Calendar platform usage
    google_calendar = models.PositiveIntegerField(default=0)
    outlook_calendar = models.PositiveIntegerField(default=0)
    apple_calendar = models.PositiveIntegerField(default=0)
    ics_downloads = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Frontend Analytics'
        verbose_name_plural = 'Frontend Analytics'

    def __str__(self):
        return f"Analytics for {self.date}"

    @property
    def total_tool_usage(self):
        return (self.vaccination_usage + self.room_measurement_usage + 
                self.budget_calculator_usage + self.pdf_downloads)

    @property
    def total_poultry_types(self):
        return self.broilers_count + self.layers_count + self.sasso_kroilers_count

