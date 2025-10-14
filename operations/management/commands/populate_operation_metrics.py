from django.core.management.base import BaseCommand
from operations.models import PoultryOperation, OperationMetrics
from decimal import Decimal
import random
from datetime import timedelta


class Command(BaseCommand):
    help = 'Populate OperationMetrics with sample data for all existing poultry operations'

    def handle(self, *args, **options):
        operations = PoultryOperation.objects.all()
        created_metrics = 0
        
        self.stdout.write(f'Found {operations.count()} poultry operations to create metrics for')
        
        for operation in operations:
            # Check if metrics already exist
            if hasattr(operation, 'metrics'):
                self.stdout.write(f'  Skipping {operation.operation_name} - metrics already exist')
                continue
            
            # Generate realistic sample metrics based on poultry type
            metrics_data = self.generate_metrics_for_operation(operation)
            
            # Create the metrics record
            metrics = OperationMetrics.objects.create(
                operation=operation,
                **metrics_data
            )
            
            created_metrics += 1
            self.stdout.write(f'  Created metrics for {operation.operation_name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_metrics} operation metrics')
        )

    def generate_metrics_for_operation(self, operation):
        """Generate realistic metrics based on the operation's poultry type"""
        
        # Base metrics that vary by poultry type
        if operation.poultry_type == 'broilers':
            # Broilers typically have higher mortality but good feed conversion
            mortality_rate = Decimal(random.uniform(2.0, 5.0))  # 2-5%
            feed_conversion_ratio = Decimal(random.uniform(1.6, 2.2))  # 1.6-2.2
            average_daily_gain = Decimal(random.uniform(45, 65))  # 45-65 grams/day
            average_sale_price = Decimal(random.uniform(8.50, 12.00))  # $8.50-$12.00 per bird
            
        elif operation.poultry_type == 'layers':
            # Layers have lower mortality but higher feed costs
            mortality_rate = Decimal(random.uniform(1.0, 3.0))  # 1-3%
            feed_conversion_ratio = Decimal(random.uniform(2.0, 2.8))  # 2.0-2.8
            average_daily_gain = Decimal(random.uniform(15, 25))  # 15-25 grams/day
            average_sale_price = Decimal(random.uniform(12.00, 18.00))  # $12-$18 per bird
            
        elif operation.poultry_type == 'sasso_kroilers':
            # Sasso/Kroilers are intermediate
            mortality_rate = Decimal(random.uniform(1.5, 4.0))  # 1.5-4%
            feed_conversion_ratio = Decimal(random.uniform(1.8, 2.4))  # 1.8-2.4
            average_daily_gain = Decimal(random.uniform(35, 50))  # 35-50 grams/day
            average_sale_price = Decimal(random.uniform(10.00, 15.00))  # $10-$15 per bird
            
        else:  # local
            # Local breeds have higher mortality but lower costs
            mortality_rate = Decimal(random.uniform(3.0, 7.0))  # 3-7%
            feed_conversion_ratio = Decimal(random.uniform(2.5, 3.5))  # 2.5-3.5
            average_daily_gain = Decimal(random.uniform(20, 35))  # 20-35 grams/day
            average_sale_price = Decimal(random.uniform(6.00, 10.00))  # $6-$10 per bird
        
        # Calculate costs based on number of birds and operation duration
        num_birds = operation.number_of_birds
        days_old = operation.current_age_days or random.randint(30, 120)
        
        # Feed costs (assuming $0.50-0.80 per bird per week)
        weekly_feed_cost = Decimal(str(random.uniform(0.50, 0.80)))
        total_feed_cost = weekly_feed_cost * Decimal(str(days_old / 7)) * Decimal(str(num_birds))
        
        # Medication costs (vaccinations, treatments)
        total_medication_cost = Decimal(str(random.uniform(0.20, 0.50))) * Decimal(str(num_birds))
        
        # Labor costs (assuming $0.10-0.30 per bird)
        total_labor_cost = Decimal(str(random.uniform(0.10, 0.30))) * Decimal(str(num_birds))
        
        # Other costs (utilities, equipment, etc.)
        total_other_costs = Decimal(str(random.uniform(0.15, 0.40))) * Decimal(str(num_birds))
        
        # Calculate total revenue (only if operation is completed or near completion)
        if operation.status == 'completed' or operation.days_remaining and operation.days_remaining < 7:
            # Calculate revenue based on surviving birds
            mortality_count = int((mortality_rate / Decimal('100')) * Decimal(str(num_birds)))
            surviving_birds = num_birds - mortality_count
            total_revenue = average_sale_price * Decimal(str(surviving_birds))
        else:
            # Estimate future revenue
            mortality_count = int((mortality_rate / Decimal('100')) * Decimal(str(num_birds)))
            surviving_birds = num_birds - mortality_count
            total_revenue = average_sale_price * Decimal(str(surviving_birds)) * Decimal('0.8')  # 80% of potential
        
        return {
            'mortality_rate': mortality_rate,
            'feed_conversion_ratio': feed_conversion_ratio,
            'average_daily_gain': average_daily_gain,
            'total_feed_cost': total_feed_cost,
            'total_medication_cost': total_medication_cost,
            'total_labor_cost': total_labor_cost,
            'total_other_costs': total_other_costs,
            'total_revenue': total_revenue,
            'average_sale_price': average_sale_price,
        }
