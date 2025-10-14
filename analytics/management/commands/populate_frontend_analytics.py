from django.core.management.base import BaseCommand
from django.db.models import Count, Q
from django.utils import timezone
from datetime import date, timedelta
from analytics.models import ToolUsageEvent, VaccinationSubmission, FrontendAnalytics


class Command(BaseCommand):
    help = 'Populate FrontendAnalytics with aggregated data from ToolUsageEvent and VaccinationSubmission'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to process (default: 30)'
        )

    def handle(self, *args, **options):
        days = options['days']
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        self.stdout.write(f'Processing analytics data from {start_date} to {end_date}')
        
        # Clear existing data for the date range
        FrontendAnalytics.objects.filter(date__gte=start_date, date__lte=end_date).delete()
        
        current_date = start_date
        while current_date <= end_date:
            self.populate_daily_analytics(current_date)
            current_date += timedelta(days=1)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully populated analytics for {days} days')
        )

    def populate_daily_analytics(self, target_date):
        """Populate analytics for a specific date"""
        start_datetime = timezone.make_aware(
            timezone.datetime.combine(target_date, timezone.datetime.min.time())
        )
        end_datetime = timezone.make_aware(
            timezone.datetime.combine(target_date, timezone.datetime.max.time())
        )
        
        # Get tool usage events for the day
        tool_events = ToolUsageEvent.objects.filter(
            timestamp__gte=start_datetime,
            timestamp__lt=end_datetime
        )
        
        # Get vaccination submissions for the day
        vaccination_submissions = VaccinationSubmission.objects.filter(
            created_at__gte=start_datetime,
            created_at__lt=end_datetime
        )
        
        # Calculate metrics
        total_users = tool_events.values('session_id').distinct().count()
        total_sessions = tool_events.values('session_id').distinct().count()
        total_page_views = tool_events.count()
        
        # Tool usage counts
        vaccination_usage = tool_events.filter(tool_name='vaccination').count()
        room_measurement_usage = tool_events.filter(tool_name='roomMeasurement').count()
        budget_calculator_usage = tool_events.filter(tool_name='budgetCalculator').count()
        pdf_downloads = tool_events.filter(tool_name='pdfDownloader').count()
        calendar_integrations = tool_events.filter(action='calendar_add').count()
        
        # Poultry type counts from vaccination submissions
        broilers_count = vaccination_submissions.filter(poultry_type='broilers').count()
        layers_count = vaccination_submissions.filter(poultry_type='layers').count()
        sasso_kroilers_count = vaccination_submissions.filter(poultry_type='sasso/kroilers').count()
        
        # Geographic distribution (store as JSON)
        country_counts = {}
        for submission in vaccination_submissions:
            country = submission.country or 'Unknown'
            country_counts[country] = country_counts.get(country, 0) + 1
        
        # Sort countries by count and take top 5
        top_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Device statistics
        mobile_usage = tool_events.filter(device_type='mobile').count()
        tablet_usage = tool_events.filter(device_type='tablet').count()
        desktop_usage = tool_events.filter(device_type='desktop').count()
        
        # Create or update the analytics record
        analytics, created = FrontendAnalytics.objects.get_or_create(
            date=target_date,
            defaults={
                'total_users': total_users,
                'total_sessions': total_sessions,
                'total_page_views': total_page_views,
                'vaccination_usage': vaccination_usage,
                'room_measurement_usage': room_measurement_usage,
                'budget_calculator_usage': budget_calculator_usage,
                'pdf_downloads': pdf_downloads,
                'calendar_integrations': calendar_integrations,
                'broilers_count': broilers_count,
                'layers_count': layers_count,
                'sasso_kroilers_count': sasso_kroilers_count,
                'top_countries': top_countries,
                'mobile_usage': mobile_usage,
                'tablet_usage': tablet_usage,
                'desktop_usage': desktop_usage,
            }
        )
        
        if not created:
            # Update existing record
            analytics.total_users = total_users
            analytics.total_sessions = total_sessions
            analytics.total_page_views = total_page_views
            analytics.vaccination_usage = vaccination_usage
            analytics.room_measurement_usage = room_measurement_usage
            analytics.budget_calculator_usage = budget_calculator_usage
            analytics.pdf_downloads = pdf_downloads
            analytics.calendar_integrations = calendar_integrations
            analytics.broilers_count = broilers_count
            analytics.layers_count = layers_count
            analytics.sasso_kroilers_count = sasso_kroilers_count
            analytics.top_countries = top_countries
            analytics.mobile_usage = mobile_usage
            analytics.tablet_usage = tablet_usage
            analytics.desktop_usage = desktop_usage
            analytics.save()
        
        self.stdout.write(f'  {target_date}: {total_users} users, {total_page_views} page views, {vaccination_usage} vaccinations')
