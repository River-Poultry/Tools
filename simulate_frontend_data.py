#!/usr/bin/env python
"""
Script to simulate real data from tools.riverpoultry.com frontend
This simulates vaccination schedule submissions and tool usage events
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
import random

# Setup Django
sys.path.append('/Users/RICHOBUKU/Firebase Growmax/river-poultry-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'river_poultry_backend.settings')
django.setup()

from analytics.models import VaccinationSubmission, ToolUsageEvent
from users.models import User

def create_sample_vaccination_submissions():
    """Create sample vaccination submissions from frontend"""
    
    # Sample vaccination schedules
    vaccination_schedules = {
        'broilers': [
            {'age': 'Day 1', 'vaccine': "Marek's disease", 'route': 'SC / hatchery', 'notes': 'Protection against tumors'},
            {'age': 'Day 1', 'vaccine': 'Newcastle + IB', 'route': 'Spray / Eye-drop', 'notes': 'Respiratory protection'},
            {'age': 'Day 7–10', 'vaccine': 'IBD (Gumboro)', 'route': 'Water / Eye-drop', 'notes': 'Protect immune organs'},
            {'age': 'Day 14–21', 'vaccine': 'Newcastle + IB (Booster)', 'route': 'Water / Spray', 'notes': 'Reinforce protection'},
        ],
        'layers': [
            {'age': 'Day 1', 'vaccine': "Marek's disease", 'route': 'SC / hatchery', 'notes': 'Early protection'},
            {'age': 'Day 1', 'vaccine': 'Newcastle + IB', 'route': 'Spray / Eye-drop', 'notes': 'Respiratory coverage'},
            {'age': 'Week 2–3', 'vaccine': 'IBD (Gumboro)', 'route': 'Water / Eye-drop', 'notes': 'Build immunity'},
            {'age': 'Week 4–5', 'vaccine': 'Fowl Pox, Cholera', 'route': 'Wing-web / IM', 'notes': 'Long-term health'},
            {'age': 'Week 5–6', 'vaccine': 'Fowl Typhoid (1st Dose)', 'route': 'Drinking Water', 'notes': 'Early protection'},
        ],
        'sasso/kroilers': [
            {'age': 'Day 1', 'vaccine': "Marek's; Newcastle + IB", 'route': 'SC / Spray', 'notes': 'Same as broilers'},
            {'age': 'Week 1–2', 'vaccine': 'IBD (Gumboro)', 'route': 'Water / Eye-drop', 'notes': 'Early immunity'},
            {'age': 'Week 4–6', 'vaccine': 'Fowl Pox, Cholera', 'route': 'Wing-web / IM', 'notes': 'Local disease risk'},
            {'age': 'Week 5–6', 'vaccine': 'Fowl Typhoid (1st Dose)', 'route': 'Drinking Water', 'notes': 'Early protection'},
        ]
    }
    
    countries = ['Nigeria', 'Ghana', 'Kenya', 'Uganda', 'Tanzania', 'South Africa', 'Ethiopia', 'Morocco']
    regions = ['Lagos', 'Accra', 'Nairobi', 'Kampala', 'Dar es Salaam', 'Cape Town', 'Addis Ababa', 'Casablanca']
    device_types = ['mobile', 'tablet', 'desktop']
    poultry_types = ['broilers', 'layers', 'sasso/kroilers']
    
    # Create 20 sample submissions
    for i in range(20):
        poultry_type = random.choice(poultry_types)
        country = random.choice(countries)
        region = random.choice(regions)
        device_type = random.choice(device_types)
        
        # Random arrival date between 30 days ago and 60 days in the future
        arrival_date = date.today() + timedelta(days=random.randint(-30, 60))
        
        # Calculate estimated sale date
        if poultry_type == 'broilers':
            days_to_sale = 42
        elif poultry_type == 'layers':
            days_to_sale = 500
        else:  # sasso/kroilers
            days_to_sale = 120
            
        estimated_sale_date = arrival_date + timedelta(days=days_to_sale)
        
        submission = VaccinationSubmission.objects.create(
            id=f"vacc_sub_{i+1:03d}",
            session_id=f"session_{random.randint(1000, 9999)}",
            poultry_type=poultry_type,
            arrival_date=arrival_date,
            batch_name=f"Batch {i+1}",
            batch_size=random.randint(500, 5000),
            vaccination_schedule=vaccination_schedules[poultry_type],
            total_vaccinations=len(vaccination_schedules[poultry_type]),
            estimated_sale_date=estimated_sale_date,
            farmer_name=f"Farmer {i+1}",
            farmer_email=f"farmer{i+1}@example.com",
            farmer_phone=f"+234{random.randint(800000000, 999999999)}",
            farm_location=f"{region}, {country}",
            country=country,
            region=region,
            device_type=device_type,
            status=random.choice(['submitted', 'processed', 'assigned_vet', 'completed'])
        )
        
        print(f"Created vaccination submission: {poultry_type} - {submission.batch_name} from {country}")

def create_sample_tool_usage_events():
    """Create sample tool usage events from frontend"""
    
    tools = ['vaccination', 'roomMeasurement', 'budgetCalculator']
    actions = ['view', 'calculate', 'download', 'calendar_add']
    countries = ['Nigeria', 'Ghana', 'Kenya', 'Uganda', 'Tanzania', 'South Africa', 'Ethiopia', 'Morocco']
    device_types = ['mobile', 'tablet', 'desktop']
    os_types = ['Windows', 'macOS', 'Linux', 'Android', 'iOS']
    browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
    
    # Create 50 sample tool usage events
    for i in range(50):
        tool_name = random.choice(tools)
        action = random.choice(actions)
        country = random.choice(countries)
        device_type = random.choice(device_types)
        os_type = random.choice(os_types)
        browser = random.choice(browsers)
        
        # Random timestamp within last 30 days
        timestamp = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        event = ToolUsageEvent.objects.create(
            id=f"event_{i+1:03d}",
            tool_name=tool_name,
            session_id=f"session_{random.randint(1000, 9999)}",
            timestamp=timestamp,
            action=action,
            metadata={
                'poultry_type': random.choice(['broilers', 'layers', 'sasso/kroilers']) if tool_name == 'vaccination' else None,
                'batch_size': random.randint(500, 5000) if tool_name == 'vaccination' else None,
                'location': {
                    'country': country,
                    'region': f"Region {random.randint(1, 10)}",
                    'city': f"City {random.randint(1, 20)}",
                    'timezone': 'Africa/Lagos'
                },
                'device': {
                    'type': device_type,
                    'os': os_type,
                    'browser': browser
                }
            },
            country=country,
            region=f"Region {random.randint(1, 10)}",
            city=f"City {random.randint(1, 20)}",
            timezone='Africa/Lagos',
            device_type=device_type,
            os=os_type,
            browser=browser
        )
        
        print(f"Created tool usage event: {tool_name} - {action} from {country}")

def main():
    """Main function to create sample data"""
    print("Creating sample data from tools.riverpoultry.com...")
    
    # Clear existing data
    VaccinationSubmission.objects.all().delete()
    ToolUsageEvent.objects.all().delete()
    print("Cleared existing sample data")
    
    # Create new sample data
    create_sample_vaccination_submissions()
    create_sample_tool_usage_events()
    
    print(f"\nSample data created successfully!")
    print(f"Vaccination submissions: {VaccinationSubmission.objects.count()}")
    print(f"Tool usage events: {ToolUsageEvent.objects.count()}")
    print("\nVisit http://localhost:8000/admin/ to see the real data in the dashboard!")

if __name__ == '__main__':
    main()


