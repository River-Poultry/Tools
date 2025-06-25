from django.core.management.base import BaseCommand
from portfolio.models import MSME


class Command(BaseCommand):
    help = 'Generate MSME codes for existing records that do not have them'

    def handle(self, *args, **options):
        # Get all MSMEs without codes
        msmes_without_codes = MSME.objects.filter(msme_code='')
        
        if not msmes_without_codes.exists():
            self.stdout.write(
                self.style.SUCCESS('All MSMEs already have codes assigned.')
            )
            return
        
        self.stdout.write(f'Found {msmes_without_codes.count()} MSMEs without codes.')
        
        # Generate codes for each MSME
        for msme in msmes_without_codes:
            # Save the MSME to trigger the auto-code generation
            msme.save()
            self.stdout.write(f'Generated code {msme.msme_code} for {msme.business_name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully generated codes for {msmes_without_codes.count()} MSMEs.')
        ) 