from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class PoultryOperation(models.Model):
    """Model for managing poultry operations"""
    
    POULTRY_TYPES = [
        ('broilers', 'Broilers'),
        ('layers', 'Layers'),
        ('sasso_kroilers', 'Sasso/Kroilers'),
        ('local', 'Local'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='operations')
    operation_name = models.CharField(max_length=200)
    poultry_type = models.CharField(max_length=20, choices=POULTRY_TYPES)
    batch_name = models.CharField(max_length=100, blank=True, null=True)
    arrival_date = models.DateField()
    expected_sale_date = models.DateField(blank=True, null=True)
    number_of_birds = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    current_age_days = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Additional operation details
    breed = models.CharField(max_length=100, blank=True, null=True)
    source = models.CharField(max_length=200, blank=True, null=True)  # Hatchery or supplier
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Poultry Operation'
        verbose_name_plural = 'Poultry Operations'
    
    def __str__(self):
        return f"{self.operation_name} - {self.poultry_type.title()} ({self.number_of_birds} birds)"
    
    @property
    def current_age_weeks(self):
        """Return current age in weeks"""
        return self.current_age_days // 7
    
    @property
    def days_remaining(self):
        """Calculate days remaining until expected sale date"""
        if self.expected_sale_date:
            from django.utils import timezone
            today = timezone.now().date()
            return (self.expected_sale_date - today).days
        return None
    
    @property
    def is_overdue(self):
        """Check if operation is overdue for sale"""
        if self.expected_sale_date and self.status == 'active':
            from django.utils import timezone
            today = timezone.now().date()
            return today > self.expected_sale_date
        return False


class OperationMetrics(models.Model):
    """Model for tracking operation performance metrics"""
    
    operation = models.OneToOneField(PoultryOperation, on_delete=models.CASCADE, related_name='metrics')
    
    # Performance metrics
    mortality_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Mortality rate percentage")
    feed_conversion_ratio = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    average_daily_gain = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Grams per day")
    
    # Financial metrics
    total_feed_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_medication_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_labor_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_other_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Revenue
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    average_sale_price = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Metrics for {self.operation.operation_name}"
    
    @property
    def total_costs(self):
        """Calculate total costs"""
        return (
            self.total_feed_cost + 
            self.total_medication_cost + 
            self.total_labor_cost + 
            self.total_other_costs
        )
    
    @property
    def profit(self):
        """Calculate profit"""
        return self.total_revenue - self.total_costs
    
    @property
    def profit_margin(self):
        """Calculate profit margin percentage"""
        if self.total_revenue > 0:
            return (self.profit / self.total_revenue) * 100
        return 0