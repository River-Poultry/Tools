from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from django.core.paginator import Paginator
from django.db.models.functions import TruncDate, TruncHour
import json

from analytics.models import ToolUsageEvent, VaccinationSubmission
from operations.models import PoultryOperation
from vaccinations.models import VaccinationPlan, VaccinationTemplate


@staff_member_required
def user_activity_dashboard(request):
    """Main dashboard showing real-time user activity from frontend"""
    
    # Get time ranges
    now = timezone.now()
    today = now.date()
    yesterday = today - timedelta(days=1)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Real-time user activity (last 24 hours)
    recent_activity = ToolUsageEvent.objects.filter(
        timestamp__gte=now - timedelta(hours=24)
    ).order_by('-timestamp')[:50]
    
    # User statistics
    total_users = ToolUsageEvent.objects.values('session_id').distinct().count()
    active_today = ToolUsageEvent.objects.filter(
        timestamp__gte=now.replace(hour=0, minute=0, second=0, microsecond=0)
    ).values('session_id').distinct().count()
    
    # Tool usage statistics
    tool_usage_stats = ToolUsageEvent.objects.filter(
        timestamp__gte=week_ago
    ).values('tool_name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Geographic distribution
    geographic_stats = VaccinationSubmission.objects.exclude(
        country__isnull=True
    ).values('country').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Poultry type distribution
    poultry_type_stats = VaccinationSubmission.objects.values('poultry_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent vaccination submissions
    recent_submissions = VaccinationSubmission.objects.order_by('-created_at')[:20]
    
    # Hourly activity for today
    hourly_activity = ToolUsageEvent.objects.filter(
        timestamp__gte=now.replace(hour=0, minute=0, second=0, microsecond=0)
    ).extra(
        select={'hour': 'EXTRACT(hour FROM timestamp)'}
    ).values('hour').annotate(
        count=Count('id')
    ).order_by('hour')
    
    # Device type statistics
    device_stats = VaccinationSubmission.objects.values('device_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Status distribution of vaccination submissions
    status_stats = VaccinationSubmission.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    context = {
        'total_users': total_users,
        'active_today': active_today,
        'recent_activity': recent_activity,
        'tool_usage_stats': tool_usage_stats,
        'geographic_stats': geographic_stats,
        'poultry_type_stats': poultry_type_stats,
        'recent_submissions': recent_submissions,
        'hourly_activity': hourly_activity,
        'device_stats': device_stats,
        'status_stats': status_stats,
        'today': today,
        'week_ago': week_ago,
        'month_ago': month_ago,
    }
    
    return render(request, 'admin_dashboard/user_activity_dashboard.html', context)


@staff_member_required
def vaccination_activity(request):
    """Detailed view of vaccination-related user activity"""
    
    # Recent vaccination submissions with pagination
    submissions = VaccinationSubmission.objects.order_by('-created_at')
    paginator = Paginator(submissions, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Vaccination statistics
    total_submissions = VaccinationSubmission.objects.count()
    pending_submissions = VaccinationSubmission.objects.filter(status='submitted').count()
    processed_submissions = VaccinationSubmission.objects.filter(status='processed').count()
    completed_submissions = VaccinationSubmission.objects.filter(status='completed').count()
    
    # Recent vaccination plan activity
    recent_plans = VaccinationPlan.objects.order_by('-created_at')[:20]
    
    # Vaccination template usage
    template_usage = VaccinationTemplate.objects.annotate(
        usage_count=Count('vaccinationplan')
    ).order_by('-usage_count')
    
    # Monthly vaccination trends
    monthly_trends = VaccinationSubmission.objects.annotate(
        month=TruncDate('created_at')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')[-12:]  # Last 12 months
    
    context = {
        'page_obj': page_obj,
        'total_submissions': total_submissions,
        'pending_submissions': pending_submissions,
        'processed_submissions': processed_submissions,
        'completed_submissions': completed_submissions,
        'recent_plans': recent_plans,
        'template_usage': template_usage,
        'monthly_trends': monthly_trends,
    }
    
    return render(request, 'admin_dashboard/vaccination_activity.html', context)


@staff_member_required
def user_analytics_api(request):
    """API endpoint for real-time user analytics data"""
    
    # Get time range from request
    hours = int(request.GET.get('hours', 24))
    now = timezone.now()
    start_time = now - timedelta(hours=hours)
    
    # Real-time activity data
    activity_data = ToolUsageEvent.objects.filter(
        timestamp__gte=start_time
    ).extra(
        select={'hour': 'EXTRACT(hour FROM timestamp)'}
    ).values('hour', 'tool_name').annotate(
        count=Count('id')
    ).order_by('hour', 'tool_name')
    
    # User session data
    session_data = ToolUsageEvent.objects.filter(
        timestamp__gte=start_time
    ).values('session_id').annotate(
        total_actions=Count('id'),
        last_activity=F('timestamp')
    ).order_by('-last_activity')[:20]
    
    # Geographic activity
    geo_data = VaccinationSubmission.objects.filter(
        created_at__gte=start_time
    ).values('country').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return JsonResponse({
        'activity_data': list(activity_data),
        'session_data': list(session_data),
        'geo_data': list(geo_data),
        'timestamp': now.isoformat(),
    })


@staff_member_required
def tool_usage_details(request, tool_name):
    """Detailed view of specific tool usage"""
    
    # Get tool usage events
    tool_events = ToolUsageEvent.objects.filter(
        tool_name=tool_name
    ).order_by('-timestamp')
    
    # Pagination
    paginator = Paginator(tool_events, 50)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Tool statistics
    total_usage = tool_events.count()
    unique_sessions = tool_events.values('session_id').distinct().count()
    
    # Recent usage (last 7 days)
    recent_usage = tool_events.filter(
        timestamp__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Action breakdown
    action_breakdown = tool_events.values('action').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Hourly usage pattern
    hourly_pattern = tool_events.extra(
        select={'hour': 'EXTRACT(hour FROM timestamp)'}
    ).values('hour').annotate(
        count=Count('id')
    ).order_by('hour')
    
    context = {
        'tool_name': tool_name,
        'page_obj': page_obj,
        'total_usage': total_usage,
        'unique_sessions': unique_sessions,
        'recent_usage': recent_usage,
        'action_breakdown': action_breakdown,
        'hourly_pattern': hourly_pattern,
    }
    
    return render(request, 'admin_dashboard/tool_usage_details.html', context)


@staff_member_required
def geographic_analytics(request):
    """Geographic distribution of user activity"""
    
    # Country statistics
    country_stats = VaccinationSubmission.objects.exclude(
        country__isnull=True
    ).values('country').annotate(
        total_submissions=Count('id'),
        unique_sessions=Count('session_id', distinct=True)
    ).order_by('-total_submissions')
    
    # Regional breakdown
    regional_stats = VaccinationSubmission.objects.exclude(
        region__isnull=True
    ).values('region', 'country').annotate(
        count=Count('id')
    ).order_by('-count')[:20]
    
    # Device usage by country
    device_by_country = VaccinationSubmission.objects.exclude(
        country__isnull=True
    ).values('country', 'device_type').annotate(
        count=Count('id')
    ).order_by('country', '-count')
    
    # Recent activity by location
    recent_location_activity = VaccinationSubmission.objects.exclude(
        country__isnull=True
    ).order_by('-created_at')[:30]
    
    context = {
        'country_stats': country_stats,
        'regional_stats': regional_stats,
        'device_by_country': device_by_country,
        'recent_location_activity': recent_location_activity,
    }
    
    return render(request, 'admin_dashboard/geographic_analytics.html', context)


@staff_member_required
def real_time_monitor(request):
    """Real-time monitoring of user activity"""
    
    # Live activity feed (last 100 events)
    live_activity = ToolUsageEvent.objects.order_by('-timestamp')[:100]
    
    # Active sessions (last 30 minutes)
    active_sessions = ToolUsageEvent.objects.filter(
        timestamp__gte=timezone.now() - timedelta(minutes=30)
    ).values('session_id').distinct().count()
    
    # Current tool usage
    current_tool_usage = ToolUsageEvent.objects.filter(
        timestamp__gte=timezone.now() - timedelta(hours=1)
    ).values('tool_name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    context = {
        'live_activity': live_activity,
        'active_sessions': active_sessions,
        'current_tool_usage': current_tool_usage,
    }
    
    return render(request, 'admin_dashboard/real_time_monitor.html', context)