#!/usr/bin/env python3
"""
Setup script for vaccination reminder system
Creates sample vaccination plans and reminder schedules for testing
"""

import os
import sys
import django
from datetime import date, timedelta

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'river_poultry_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from operations.models import PoultryOperation
from vaccinations.models import VaccinationPlan, VaccinationTemplate
from vaccinations.reminder_service import VaccinationReminderService

User = get_user_model()

def create_sample_data():
    """Create sample vaccination plans and reminder schedules"""
    
    print("Setting up vaccination reminder system...")
    
    # Get or create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@riverpoultry.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("Created admin user")
    else:
        print("Admin user already exists")
    
    # Get or create a sample operation
    from datetime import date
    operation, created = PoultryOperation.objects.get_or_create(
        operation_name='Sample Poultry Farm',
        defaults={
            'user': admin_user,
            'poultry_type': 'broilers',
            'arrival_date': date.today() - timedelta(days=7),
            'number_of_birds': 1000,
            'current_age_days': 7,
            'breed': 'Cobb 500',
            'source': 'Sample Hatchery',
            'notes': 'Sample operation for testing vaccination reminders',
        }
    )
    
    if created:
        print("Created sample operation")
    else:
        print("Sample operation already exists")
    
    # Create sample vaccination templates
    templates_data = [
        {
            'poultry_type': 'broilers',
            'vaccine_name': 'Newcastle Disease (ND)',
            'age_days': 7,
            'route': 'drinking_water',
            'dosage': '1ml per liter',
            'notes': 'First vaccination for Newcastle Disease',
        },
        {
            'poultry_type': 'broilers',
            'vaccine_name': 'Infectious Bursal Disease (IBD)',
            'age_days': 14,
            'route': 'drinking_water',
            'dosage': '1ml per liter',
            'notes': 'Gumboro vaccination',
        },
        {
            'poultry_type': 'broilers',
            'vaccine_name': 'Fowl Pox',
            'age_days': 21,
            'route': 'wing_web',
            'dosage': '0.1ml per bird',
            'notes': 'Wing web vaccination',
        },
    ]
    
    for template_data in templates_data:
        template, created = VaccinationTemplate.objects.get_or_create(
            poultry_type=template_data['poultry_type'],
            vaccine_name=template_data['vaccine_name'],
            age_days=template_data['age_days'],
            defaults=template_data
        )
        
        if created:
            print(f"Created template: {template}")
    
    # Create sample vaccination plans
    today = date.today()
    vaccination_plans_data = [
        {
            'vaccine_name': 'Newcastle Disease (ND)',
            'scheduled_date': today + timedelta(days=1),  # Tomorrow
            'age_days': 7,
            'route': 'drinking_water',
            'dosage': '1ml per liter',
            'notes': 'First ND vaccination',
        },
        {
            'vaccine_name': 'Infectious Bursal Disease (IBD)',
            'scheduled_date': today + timedelta(days=3),  # Day after tomorrow
            'age_days': 14,
            'route': 'drinking_water',
            'dosage': '1ml per liter',
            'notes': 'Gumboro vaccination',
        },
        {
            'vaccine_name': 'Fowl Pox',
            'scheduled_date': today + timedelta(days=7),  # Next week
            'age_days': 21,
            'route': 'wing_web',
            'dosage': '0.1ml per bird',
            'notes': 'Wing web vaccination',
        },
    ]
    
    reminder_service = VaccinationReminderService()
    
    for plan_data in vaccination_plans_data:
        vaccination_plan, created = VaccinationPlan.objects.get_or_create(
            operation=operation,
            vaccine_name=plan_data['vaccine_name'],
            scheduled_date=plan_data['scheduled_date'],
            defaults=plan_data
        )
        
        if created:
            print(f"Created vaccination plan: {vaccination_plan}")
            
            # Create reminder schedule
            reminders = reminder_service.create_reminder_schedule(vaccination_plan)
            print(f"Created {len(reminders)} reminder schedules")
        else:
            print(f"Vaccination plan already exists: {vaccination_plan}")
    
    print("\n=== SETUP COMPLETE ===")
    print("Sample data created:")
    print(f"- Admin user: admin / admin123")
    print(f"- Sample operation: {operation.operation_name}")
    print(f"- {VaccinationTemplate.objects.count()} vaccination templates")
    print(f"- {VaccinationPlan.objects.count()} vaccination plans")
    print(f"- Reminder schedules created for all plans")
    
    print("\n=== NEXT STEPS ===")
    print("1. Login to admin panel: http://127.0.0.1:8000/admin/")
    print("2. Check notifications admin: http://127.0.0.1:8000/admin/notifications/")
    print("3. Test reminder system:")
    print("   python manage.py send_vaccination_reminders --dry-run")
    print("4. Send actual reminders:")
    print("   python manage.py send_vaccination_reminders")
    
    print("\n=== API ENDPOINTS ===")
    print("- GET /api/vaccinations/reminders/upcoming/ - View upcoming reminders")
    print("- GET /api/vaccinations/reminders/stats/ - View reminder statistics")
    print("- POST /api/vaccinations/plans/{id}/reminders/create/ - Create reminder schedule")
    print("- POST /api/vaccinations/plans/{id}/reminders/test/ - Send test reminder")

if __name__ == '__main__':
    create_sample_data()
