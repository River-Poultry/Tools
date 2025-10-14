from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Veterinarian(models.Model):
    """Model for veterinarian network"""
    
    SPECIALIZATIONS = [
        ('poultry', 'Poultry Medicine'),
        ('general', 'General Practice'),
        ('surgery', 'Surgery'),
        ('pathology', 'Pathology'),
        ('nutrition', 'Nutrition'),
        ('reproduction', 'Reproduction'),
        ('emergency', 'Emergency Care'),
    ]
    
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    license_number = models.CharField(max_length=100, unique=True)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATIONS)
    location = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    
    # Professional details
    years_experience = models.PositiveIntegerField(blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    certifications = models.TextField(blank=True, null=True)
    languages = models.CharField(max_length=200, blank=True, null=True)
    
    # Availability
    is_available = models.BooleanField(default=True)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    emergency_fee = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    
    # Verification and rating
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Profile
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='veterinarians/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rating', 'name']
        verbose_name = 'Veterinarian'
        verbose_name_plural = 'Veterinarians'
    
    def __str__(self):
        return f"Dr. {self.name} - {self.specialization.title()}"
    
    @property
    def full_name(self):
        return f"Dr. {self.name}"


class UserVeterinarian(models.Model):
    """Model for user-veterinarian relationships"""
    
    RELATIONSHIP_TYPES = [
        ('primary', 'Primary Veterinarian'),
        ('consultant', 'Consultant'),
        ('emergency', 'Emergency Contact'),
        ('specialist', 'Specialist'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='veterinarians')
    veterinarian = models.ForeignKey(Veterinarian, on_delete=models.CASCADE, related_name='users')
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_TYPES)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'veterinarian', 'relationship_type']
        verbose_name = 'User Veterinarian Relationship'
        verbose_name_plural = 'User Veterinarian Relationships'
    
    def __str__(self):
        return f"{self.user.full_name} - {self.veterinarian.full_name} ({self.relationship_type})"


class Consultation(models.Model):
    """Model for veterinarian consultations"""
    
    CONSULTATION_TYPES = [
        ('routine', 'Routine Checkup'),
        ('emergency', 'Emergency'),
        ('vaccination', 'Vaccination'),
        ('diagnosis', 'Diagnosis'),
        ('treatment', 'Treatment Plan'),
        ('follow_up', 'Follow-up'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultations')
    veterinarian = models.ForeignKey(Veterinarian, on_delete=models.CASCADE, related_name='consultations')
    operation = models.ForeignKey('operations.PoultryOperation', on_delete=models.CASCADE, related_name='consultations', blank=True, null=True)
    
    consultation_type = models.CharField(max_length=20, choices=CONSULTATION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Scheduling
    scheduled_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    location = models.CharField(max_length=200, blank=True, null=True)
    is_remote = models.BooleanField(default=False)
    
    # Consultation details
    reason = models.TextField()
    symptoms = models.TextField(blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    treatment_plan = models.TextField(blank=True, null=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateTimeField(blank=True, null=True)
    
    # Financial
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-scheduled_date']
        verbose_name = 'Consultation'
        verbose_name_plural = 'Consultations'
    
    def __str__(self):
        return f"{self.user.full_name} - {self.veterinarian.full_name} ({self.consultation_type})"


class VeterinarianReview(models.Model):
    """Model for veterinarian reviews and ratings"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='veterinarian_reviews')
    veterinarian = models.ForeignKey(Veterinarian, on_delete=models.CASCADE, related_name='reviews')
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='review', blank=True, null=True)
    
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    review_text = models.TextField(blank=True, null=True)
    
    # Review categories
    professionalism_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    knowledge_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    communication_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'veterinarian', 'consultation']
        ordering = ['-created_at']
        verbose_name = 'Veterinarian Review'
        verbose_name_plural = 'Veterinarian Reviews'
    
    def __str__(self):
        return f"{self.user.full_name}'s review of {self.veterinarian.full_name} ({self.rating} stars)"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update veterinarian's average rating
        self.update_veterinarian_rating()
    
    def update_veterinarian_rating(self):
        """Update the veterinarian's average rating"""
        reviews = VeterinarianReview.objects.filter(veterinarian=self.veterinarian)
        if reviews.exists():
            avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.veterinarian.rating = round(avg_rating, 2)
            self.veterinarian.total_reviews = reviews.count()
            self.veterinarian.save()