from django.core.management.base import BaseCommand
from inventory.models import InventoryCategory


class Command(BaseCommand):
    help = 'Set up default inventory categories'

    def handle(self, *args, **options):
        """Create default inventory categories"""
        
        categories = [
            {
                'name': 'Vaccines',
                'description': 'Poultry vaccines for disease prevention',
                'icon': 'fas fa-syringe',
                'color': '#1B4D3E'  # River Poultry primary green
            },
            {
                'name': 'Antibiotics',
                'description': 'Antibiotic medications for treatment',
                'icon': 'fas fa-pills',
                'color': '#2D7A5F'  # River Poultry secondary green
            },
            {
                'name': 'Disinfectants',
                'description': 'Cleaning and disinfecting products',
                'icon': 'fas fa-spray-can',
                'color': '#DAA520'  # River Poultry gold
            },
            {
                'name': 'Tools & Equipment',
                'description': 'Farming tools and equipment',
                'icon': 'fas fa-tools',
                'color': '#F4E4BC'  # River Poultry light green
            },
            {
                'name': 'Feed & Supplements',
                'description': 'Poultry feed and nutritional supplements',
                'icon': 'fas fa-seedling',
                'color': '#8B4513'  # Brown for feed
            },
            {
                'name': 'Medical Supplies',
                'description': 'General medical supplies and equipment',
                'icon': 'fas fa-medkit',
                'color': '#DC3545'  # Red for medical
            },
            {
                'name': 'Housing & Infrastructure',
                'description': 'Building materials and housing supplies',
                'icon': 'fas fa-home',
                'color': '#6C757D'  # Gray for infrastructure
            },
            {
                'name': 'Safety Equipment',
                'description': 'Personal protective equipment and safety gear',
                'icon': 'fas fa-hard-hat',
                'color': '#FFC107'  # Yellow for safety
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for category_data in categories:
            category, created = InventoryCategory.objects.get_or_create(
                name=category_data['name'],
                defaults=category_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
            else:
                # Update existing category with new data
                for key, value in category_data.items():
                    if key != 'name':  # Don't update the name
                        setattr(category, key, value)
                category.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated category: {category.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nInventory categories setup complete!\n'
                f'Created: {created_count}\n'
                f'Updated: {updated_count}\n'
                f'Total categories: {InventoryCategory.objects.count()}'
            )
        )


