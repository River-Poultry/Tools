from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from analytics.models import VaccinationSubmission
from operations.models import PoultryOperation
from vaccinations.models import VaccinationPlan
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Create missing vaccination plans for existing submissions that failed to create operations'

    def handle(self, *args, **options):
        # Get default user
        default_user = User.objects.first()
        if not default_user:
            self.stdout.write(self.style.ERROR('No users found in the system'))
            return

        # Get all submissions that don't have corresponding operations
        submissions = VaccinationSubmission.objects.all()
        created_operations = 0
        created_plans = 0

        for submission in submissions:
            # Check if an operation already exists for this submission
            operation_name = f"{submission.batch_name} - {submission.farmer_name}"
            existing_operation = PoultryOperation.objects.filter(
                operation_name=operation_name
            ).first()

            if not existing_operation:
                # Create the missing operation
                try:
                    operation = PoultryOperation.objects.create(
                        operation_name=operation_name,
                        poultry_type=submission.poultry_type,
                        batch_name=submission.batch_name,
                        arrival_date=submission.arrival_date,
                        expected_sale_date=submission.estimated_sale_date,
                        number_of_birds=submission.batch_size,
                        user=default_user
                    )
                    created_operations += 1
                    self.stdout.write(f'Created operation: {operation.operation_name}')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Failed to create operation for {operation_name}: {e}'))
                    continue
            else:
                operation = existing_operation

            # Create vaccination plans for this submission
            for vaccine_schedule in submission.vaccination_schedule:
                try:
                    # Handle different age field formats
                    age_days = 0
                    if 'age_days' in vaccine_schedule:
                        age_days = vaccine_schedule['age_days']
                    elif 'age' in vaccine_schedule:
                        # Parse age field like "Day 1", "Week 2-3", etc.
                        age_str = vaccine_schedule['age']
                        if 'Day' in age_str:
                            day_str = age_str.split('Day')[1].strip()
                            if '–' in day_str or '-' in day_str:
                                # Take the first day number for ranges like "Day 7–10"
                                age_days = int(day_str.split('–')[0].split('-')[0].strip())
                            else:
                                age_days = int(day_str)
                        elif 'Week' in age_str:
                            week_str = age_str.split('Week')[1].strip()
                            if '–' in week_str or '-' in week_str:
                                # Take the first week number
                                week_num = int(week_str.split('–')[0].split('-')[0].strip())
                                age_days = week_num * 7
                            else:
                                age_days = int(week_str) * 7
                        else:
                            # Default to 1 day if can't parse
                            age_days = 1
                    else:
                        age_days = 1  # Default fallback
                    
                    # Calculate scheduled date based on age and arrival date
                    scheduled_date = submission.arrival_date + timedelta(days=age_days)
                    
                    # Handle different vaccine name fields
                    vaccine_name = vaccine_schedule.get('vaccine_name') or vaccine_schedule.get('vaccine', 'Unknown Vaccine')
                    
                    # Check if plan already exists
                    existing_plan = VaccinationPlan.objects.filter(
                        operation=operation,
                        vaccine_name=vaccine_name,
                        scheduled_date=scheduled_date
                    ).first()

                    if not existing_plan:
                        plan = VaccinationPlan.objects.create(
                            operation=operation,
                            vaccine_name=vaccine_name,
                            scheduled_date=scheduled_date,
                            age_days=age_days,
                            route=vaccine_schedule.get('route', ''),
                            dosage=vaccine_schedule.get('dosage', ''),
                            notes=vaccine_schedule.get('notes', ''),
                            status='scheduled'
                        )
                        created_plans += 1
                        self.stdout.write(f'  Created plan: {plan.vaccine_name} on {plan.scheduled_date}')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Failed to create plan for {vaccine_schedule}: {e}'))

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_operations} operations and {created_plans} vaccination plans')
        )
