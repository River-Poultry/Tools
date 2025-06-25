from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class Portfolio(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
    def total_value(self):
        """Calculate total value of all investments in this portfolio"""
        return sum(investment.current_value() for investment in self.investments.all())
    
    def total_cost(self):
        """Calculate total cost of all investments in this portfolio"""
        return sum(investment.total_cost() for investment in self.investments.all())
    
    def total_return(self):
        """Calculate total return (current value - total cost)"""
        return self.total_value() - self.total_cost()
    
    def total_return_percentage(self):
        """Calculate total return as a percentage"""
        total_cost = self.total_cost()
        if total_cost == 0:
            return Decimal('0.00')
        return (self.total_return() / total_cost) * 100

class Investment(models.Model):
    INVESTMENT_TYPES = [
        ('STOCK', 'Stock'),
        ('BOND', 'Bond'),
        ('ETF', 'ETF'),
        ('MUTUAL_FUND', 'Mutual Fund'),
        ('CRYPTO', 'Cryptocurrency'),
        ('REAL_ESTATE', 'Real Estate'),
        ('OTHER', 'Other'),
    ]
    
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='investments')
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=20, blank=True)
    investment_type = models.CharField(max_length=20, choices=INVESTMENT_TYPES, default='STOCK')
    current_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    shares_quantity = models.DecimalField(max_digits=15, decimal_places=6, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.symbol}) - {self.portfolio.name}"
    
    def current_value(self):
        """Calculate current value of this investment"""
        return self.current_price * self.shares_quantity
    
    def total_cost(self):
        """Calculate total cost from all transactions"""
        return sum(txn.amount for txn in self.transactions.all() if txn.transaction_type == 'BUY')
    
    def total_return(self):
        """Calculate total return for this investment"""
        return self.current_value() - self.total_cost()
    
    def total_return_percentage(self):
        """Calculate total return as a percentage"""
        total_cost = self.total_cost()
        if total_cost == 0:
            return Decimal('0.00')
        return (self.total_return() / total_cost) * 100

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
        ('DIVIDEND', 'Dividend'),
        ('SPLIT', 'Stock Split'),
    ]
    
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    shares_quantity = models.DecimalField(max_digits=15, decimal_places=6, default=Decimal('0.00'))
    price_per_share = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    transaction_date = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.transaction_type} {self.shares_quantity} shares of {self.investment.name} on {self.transaction_date.date()}"
    
    class Meta:
        ordering = ['-transaction_date']

class MSME(models.Model):
    BUSINESS_TYPES = [
        ('MICRO', 'Micro Enterprise'),
        ('SMALL', 'Small Enterprise'),
        ('MEDIUM', 'Medium Enterprise'),
    ]
    
    SECTORS = [
        ('MANUFACTURING', 'Manufacturing'),
        ('SERVICES', 'Services'),
        ('TRADE', 'Trade'),
        ('AGRICULTURE', 'Agriculture'),
        ('CONSTRUCTION', 'Construction'),
        ('TECHNOLOGY', 'Technology'),
        ('HEALTHCARE', 'Healthcare'),
        ('EDUCATION', 'Education'),
        ('OTHER', 'Other'),
    ]
    
    # Auto-generated unique code
    msme_code = models.CharField(max_length=50, unique=True, blank=True)
    
    # Basic Information
    business_name = models.CharField(max_length=200)
    business_type = models.CharField(max_length=10, choices=BUSINESS_TYPES)
    sector = models.CharField(max_length=20, choices=SECTORS)
    registration_number = models.CharField(max_length=50, blank=True)
    
    # Contact Information
    owner_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    business_email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Nigeria')
    
    # Financial Information
    annual_revenue = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    employee_count = models.IntegerField(null=True, blank=True)
    investment_needed = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    current_funding = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Additional Information
    business_description = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    opportunities = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    source_file = models.CharField(max_length=255, blank=True)  # Track which Excel file this came from
    
    gender_choices = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=gender_choices, blank=True, null=True)
    
    def __str__(self):
        return f"{self.business_name} - {self.business_type} ({self.sector})"
    
    def save(self, *args, **kwargs):
        # Generate unique MSME code if not already set
        if not self.msme_code:
            # Get the next available number
            last_msme = MSME.objects.order_by('-msme_code').first()
            if last_msme and last_msme.msme_code:
                # Extract the number from the last code
                try:
                    last_number = int(last_msme.msme_code.split('-')[-1])
                    next_number = last_number + 1
                except (ValueError, IndexError):
                    next_number = 1
            else:
                next_number = 1
            
            # Format the code: PRUDEV2-GOPA-COHORT-XXX
            self.msme_code = f"PRUDEV2-GOPA-COHORT-{next_number:03d}"
        
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "MSME"
        verbose_name_plural = "MSMEs"
        ordering = ['-created_at']

class BusinessGrowthExpert(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    top_skills = models.CharField(max_length=200, blank=True)
    second_area = models.CharField(max_length=200, blank=True)
    third_area = models.CharField(max_length=200, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class SupportRequest(models.Model):
    msme_name = models.CharField(max_length=200)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    business_need = models.TextField()
    location = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    matched_bges = models.ManyToManyField(BusinessGrowthExpert, blank=True, related_name='support_requests')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.msme_name} - {self.business_need[:30]}..."
