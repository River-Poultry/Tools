#!/usr/bin/env python
"""
Script to create sample inventory items for demonstration
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal

# Setup Django
sys.path.append('/Users/RICHOBUKU/Firebase Growmax/river-poultry-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'river_poultry_backend.settings')
django.setup()

from inventory.models import InventoryCategory, InventoryItem, InventoryTransaction
from users.models import User

def create_sample_inventory_items():
    """Create sample inventory items"""
    
    # Get categories
    vaccines_cat = InventoryCategory.objects.get(name='Vaccines')
    antibiotics_cat = InventoryCategory.objects.get(name='Antibiotics')
    disinfectants_cat = InventoryCategory.objects.get(name='Disinfectants')
    tools_cat = InventoryCategory.objects.get(name='Tools & Equipment')
    feed_cat = InventoryCategory.objects.get(name='Feed & Supplements')
    medical_cat = InventoryCategory.objects.get(name='Medical Supplies')
    
    # Get a user for created_by
    user = User.objects.first()
    
    sample_items = [
        # Vaccines
        {
            'name': 'Newcastle Disease Vaccine',
            'category': vaccines_cat,
            'description': 'Live attenuated vaccine for Newcastle disease prevention',
            'manufacturer': 'Zoetis',
            'current_stock': Decimal('50.00'),
            'minimum_stock': Decimal('10.00'),
            'maximum_stock': Decimal('100.00'),
            'unit': 'vials',
            'unit_cost': Decimal('15.50'),
            'selling_price': Decimal('25.00'),
            'expiry_date': date.today() + timedelta(days=365),
            'storage_conditions': 'Refrigerated 2-8°C',
            'is_critical': True,
        },
        {
            'name': 'Marek\'s Disease Vaccine',
            'category': vaccines_cat,
            'description': 'Recombinant vaccine for Marek\'s disease',
            'manufacturer': 'Merial',
            'current_stock': Decimal('25.00'),
            'minimum_stock': Decimal('5.00'),
            'maximum_stock': Decimal('50.00'),
            'unit': 'vials',
            'unit_cost': Decimal('45.00'),
            'selling_price': Decimal('75.00'),
            'expiry_date': date.today() + timedelta(days=180),
            'storage_conditions': 'Frozen -20°C',
            'is_critical': True,
        },
        {
            'name': 'Infectious Bronchitis Vaccine',
            'category': vaccines_cat,
            'description': 'Live vaccine for respiratory protection',
            'manufacturer': 'Ceva',
            'current_stock': Decimal('0.00'),  # Out of stock
            'minimum_stock': Decimal('15.00'),
            'maximum_stock': Decimal('75.00'),
            'unit': 'vials',
            'unit_cost': Decimal('12.00'),
            'selling_price': Decimal('20.00'),
            'expiry_date': date.today() + timedelta(days=90),
            'storage_conditions': 'Refrigerated 2-8°C',
            'is_critical': True,
        },
        
        # Antibiotics
        {
            'name': 'Amoxicillin 20%',
            'category': antibiotics_cat,
            'description': 'Broad-spectrum antibiotic for bacterial infections',
            'manufacturer': 'Vetmed',
            'current_stock': Decimal('8.00'),
            'minimum_stock': Decimal('10.00'),
            'maximum_stock': Decimal('50.00'),
            'unit': 'bottles',
            'unit_cost': Decimal('35.00'),
            'selling_price': Decimal('55.00'),
            'expiry_date': date.today() + timedelta(days=730),
            'storage_conditions': 'Room temperature',
            'is_critical': True,
        },
        {
            'name': 'Enrofloxacin 10%',
            'category': antibiotics_cat,
            'description': 'Fluoroquinolone antibiotic for respiratory infections',
            'manufacturer': 'Bayer',
            'current_stock': Decimal('15.00'),
            'minimum_stock': Decimal('5.00'),
            'maximum_stock': Decimal('30.00'),
            'unit': 'bottles',
            'unit_cost': Decimal('28.00'),
            'selling_price': Decimal('45.00'),
            'expiry_date': date.today() + timedelta(days=30),  # Expiring soon
            'storage_conditions': 'Room temperature',
            'is_critical': True,
        },
        
        # Disinfectants
        {
            'name': 'Iodine Disinfectant',
            'category': disinfectants_cat,
            'description': 'Broad-spectrum disinfectant for equipment and surfaces',
            'manufacturer': 'Virkon',
            'current_stock': Decimal('25.00'),
            'minimum_stock': Decimal('5.00'),
            'maximum_stock': Decimal('100.00'),
            'unit': 'liters',
            'unit_cost': Decimal('8.50'),
            'selling_price': Decimal('15.00'),
            'expiry_date': date.today() + timedelta(days=1095),
            'storage_conditions': 'Room temperature',
            'is_critical': False,
        },
        {
            'name': 'Chlorhexidine Solution',
            'category': disinfectants_cat,
            'description': 'Antiseptic solution for wound cleaning',
            'manufacturer': 'Nolvasan',
            'current_stock': Decimal('12.00'),
            'minimum_stock': Decimal('10.00'),
            'maximum_stock': Decimal('50.00'),
            'unit': 'liters',
            'unit_cost': Decimal('12.00'),
            'selling_price': Decimal('20.00'),
            'expiry_date': date.today() - timedelta(days=30),  # Expired
            'storage_conditions': 'Room temperature',
            'is_critical': False,
        },
        
        # Tools & Equipment
        {
            'name': 'Syringes 1ml',
            'category': tools_cat,
            'description': 'Disposable syringes for vaccination',
            'manufacturer': 'BD',
            'current_stock': Decimal('500.00'),
            'minimum_stock': Decimal('100.00'),
            'maximum_stock': Decimal('1000.00'),
            'unit': 'pieces',
            'unit_cost': Decimal('0.15'),
            'selling_price': Decimal('0.25'),
            'expiry_date': None,
            'storage_conditions': 'Room temperature',
            'is_critical': True,
        },
        {
            'name': 'Needles 18G',
            'category': tools_cat,
            'description': 'Sterile needles for injection',
            'manufacturer': 'Terumo',
            'current_stock': Decimal('200.00'),
            'minimum_stock': Decimal('50.00'),
            'maximum_stock': Decimal('500.00'),
            'unit': 'pieces',
            'unit_cost': Decimal('0.08'),
            'selling_price': Decimal('0.12'),
            'expiry_date': None,
            'storage_conditions': 'Room temperature',
            'is_critical': True,
        },
        
        # Feed & Supplements
        {
            'name': 'Vitamin E Supplement',
            'category': feed_cat,
            'description': 'Vitamin E supplement for immune support',
            'manufacturer': 'Nutri-Vet',
            'current_stock': Decimal('20.00'),
            'minimum_stock': Decimal('5.00'),
            'maximum_stock': Decimal('50.00'),
            'unit': 'kg',
            'unit_cost': Decimal('25.00'),
            'selling_price': Decimal('40.00'),
            'expiry_date': date.today() + timedelta(days=180),
            'storage_conditions': 'Cool, dry place',
            'is_critical': False,
        },
        
        # Medical Supplies
        {
            'name': 'Bandages 4 inch',
            'category': medical_cat,
            'description': 'Sterile bandages for wound care',
            'manufacturer': 'Johnson & Johnson',
            'current_stock': Decimal('30.00'),
            'minimum_stock': Decimal('10.00'),
            'maximum_stock': Decimal('100.00'),
            'unit': 'rolls',
            'unit_cost': Decimal('3.50'),
            'selling_price': Decimal('6.00'),
            'expiry_date': None,
            'storage_conditions': 'Room temperature',
            'is_critical': False,
        },
    ]
    
    created_count = 0
    
    for item_data in sample_items:
        item, created = InventoryItem.objects.get_or_create(
            name=item_data['name'],
            defaults={
                **item_data,
                'created_by': user,
                'last_restocked': datetime.now() - timedelta(days=30)
            }
        )
        
        if created:
            created_count += 1
            print(f"Created inventory item: {item.name}")
            
            # Create initial stock transaction
            InventoryTransaction.objects.create(
                item=item,
                transaction_type='in',
                quantity=item_data['current_stock'],
                unit_cost=item_data['unit_cost'],
                reference_number=f'INIT-{item.id}',
                supplier='Initial Stock',
                notes='Initial inventory setup',
                performed_by=user,
                stock_before=Decimal('0.00'),
                stock_after=item_data['current_stock']
            )
        else:
            print(f"Item already exists: {item.name}")
    
    print(f"\nSample inventory setup complete!")
    print(f"Created: {created_count} items")
    print(f"Total inventory items: {InventoryItem.objects.count()}")

if __name__ == '__main__':
    create_sample_inventory_items()


