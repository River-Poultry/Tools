from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal

User = get_user_model()


class InventoryCategory(models.Model):
    """Categories for inventory items"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='fas fa-box')  # FontAwesome icon class
    color = models.CharField(max_length=7, default='#1B4D3E')  # Hex color for UI
    
    class Meta:
        verbose_name = 'Inventory Category'
        verbose_name_plural = 'Inventory Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    """Individual inventory items"""
    UNIT_CHOICES = [
        ('ml', 'Milliliters (ml)'),
        ('l', 'Liters (L)'),
        ('mg', 'Milligrams (mg)'),
        ('g', 'Grams (g)'),
        ('kg', 'Kilograms (kg)'),
        ('pieces', 'Pieces'),
        ('boxes', 'Boxes'),
        ('bottles', 'Bottles'),
        ('vials', 'Vials'),
        ('doses', 'Doses'),
        ('bags', 'Bags'),
        ('tubes', 'Tubes'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('discontinued', 'Discontinued'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=200)
    category = models.ForeignKey(InventoryCategory, on_delete=models.CASCADE, related_name='items')
    description = models.TextField(blank=True)
    manufacturer = models.CharField(max_length=200, blank=True)
    batch_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Inventory Details
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    minimum_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maximum_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='pieces')
    
    # Pricing
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_critical = models.BooleanField(default=False)  # For items that are critical for operations
    
    # Location and Storage
    storage_location = models.CharField(max_length=200, blank=True)
    storage_conditions = models.CharField(max_length=200, blank=True)  # e.g., "Refrigerated 2-8°C"
    
    # Usage Information
    usage_instructions = models.TextField(blank=True)
    contraindications = models.TextField(blank=True)
    
    # Tracking
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_restocked = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'status']),
            models.Index(fields=['current_stock']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['is_critical']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    @property
    def is_low_stock(self):
        """Check if item is below minimum stock level"""
        return self.current_stock <= self.minimum_stock

    @property
    def is_out_of_stock(self):
        """Check if item is out of stock"""
        return self.current_stock <= 0

    @property
    def is_expired(self):
        """Check if item is expired"""
        if not self.expiry_date:
            return False
        return self.expiry_date < timezone.now().date()

    @property
    def is_expiring_soon(self):
        """Check if item expires within 30 days"""
        if not self.expiry_date:
            return False
        return self.expiry_date <= timezone.now().date() + timezone.timedelta(days=30)

    @property
    def stock_status(self):
        """Get stock status as string"""
        if self.is_out_of_stock:
            return 'out_of_stock'
        elif self.is_low_stock:
            return 'low_stock'
        elif self.is_expired:
            return 'expired'
        elif self.is_expiring_soon:
            return 'expiring_soon'
        else:
            return 'good'

    @property
    def stock_status_display(self):
        """Get human-readable stock status"""
        status_map = {
            'out_of_stock': 'Out of Stock',
            'low_stock': 'Low Stock',
            'expired': 'Expired',
            'expiring_soon': 'Expiring Soon',
            'good': 'Good'
        }
        return status_map.get(self.stock_status, 'Unknown')


class InventoryTransaction(models.Model):
    """Track all inventory movements"""
    TRANSACTION_TYPES = [
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
        ('adjustment', 'Stock Adjustment'),
        ('transfer', 'Transfer'),
        ('waste', 'Waste/Damage'),
        ('return', 'Return'),
    ]
    
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Reference information
    reference_number = models.CharField(max_length=100, blank=True)  # Invoice, PO, etc.
    supplier = models.CharField(max_length=200, blank=True)
    customer = models.CharField(max_length=200, blank=True)
    
    # Notes and tracking
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    transaction_date = models.DateTimeField(default=timezone.now)
    
    # Stock levels before and after
    stock_before = models.DecimalField(max_digits=10, decimal_places=2)
    stock_after = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['item', 'transaction_date']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['transaction_date']),
        ]

    def __str__(self):
        return f"{self.transaction_type.title()} - {self.item.name} ({self.quantity} {self.item.unit})"

    def save(self, *args, **kwargs):
        # Calculate total cost
        self.total_cost = self.quantity * self.unit_cost
        
        # Update stock levels
        if not self.pk:  # New transaction
            self.stock_before = self.item.current_stock
            
            if self.transaction_type in ['in', 'return']:
                self.stock_after = self.stock_before + self.quantity
            elif self.transaction_type in ['out', 'waste']:
                self.stock_after = self.stock_before - self.quantity
            elif self.transaction_type == 'adjustment':
                self.stock_after = self.quantity  # Adjustment sets absolute quantity
            
            # Update item stock
            self.item.current_stock = self.stock_after
            self.item.save(update_fields=['current_stock'])
        
        super().save(*args, **kwargs)


class InventoryAlert(models.Model):
    """Alerts for inventory issues"""
    ALERT_TYPES = [
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('expiring_soon', 'Expiring Soon'),
        ('expired', 'Expired'),
        ('overstock', 'Overstock'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alerts')
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_alerts')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['alert_type', 'is_resolved']),
            models.Index(fields=['priority']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.alert_type.title()} Alert - {self.item.name}"

    def resolve(self, user, notes=''):
        """Mark alert as resolved"""
        self.is_resolved = True
        self.resolved_by = user
        self.resolved_at = timezone.now()
        self.resolved_notes = notes
        self.save()


class Supplier(models.Model):
    """Supplier information"""
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    website = models.URLField(blank=True)
    
    # Business information
    tax_id = models.CharField(max_length=100, blank=True)
    payment_terms = models.CharField(max_length=100, blank=True)
    delivery_terms = models.CharField(max_length=100, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

