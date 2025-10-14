from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, F, Q
from users.models import User
from operations.models import PoultryOperation
from vaccinations.models import VaccinationPlan, VaccinationReminder, VaccinationTemplate
from analytics.models import VaccinationSubmission, ToolUsageEvent, FrontendAnalytics
from inventory.models import InventoryItem, InventoryAlert, InventoryCategory


@staff_member_required
def admin_dashboard(request):
    """Optimized admin dashboard with efficient queries"""
    
    today = timezone.now().date()
    week_ago = timezone.now() - timedelta(days=7)
    month_ago = timezone.now() - timedelta(days=30)
    
    # Optimized queries using select_related and prefetch_related
    # Get vaccination submissions with optimized queries
    vaccination_stats = VaccinationSubmission.objects.aggregate(
        total=Count('id'),
        recent=Count('id', filter=Q(created_at__gte=week_ago)),
        upcoming=Count('id', filter=Q(
            arrival_date__gte=today,
            arrival_date__lte=today + timedelta(days=30)
        )),
        overdue=Count('id', filter=Q(
            arrival_date__lt=today,
            status__in=['submitted', 'processed']
        ))
    )
    
    # Get tool usage statistics with single query
    tool_usage_stats = ToolUsageEvent.objects.aggregate(
        total=Count('id'),
        vaccination=Count('id', filter=Q(tool_name='vaccination')),
        room_measurement=Count('id', filter=Q(tool_name='roomMeasurement')),
        budget_calculator=Count('id', filter=Q(tool_name='budgetCalculator'))
    )
    
    # Veterinarian and assignment stats
    vet_stats = {
        'total_veterinarians': User.objects.filter(admin_role='veterinarian').count(),
        'assigned_submissions': VaccinationSubmission.objects.filter(
            assigned_veterinarian__isnull=False
        ).count()
    }
    
    # Inventory stats with optimized queries
    inventory_stats = InventoryItem.objects.aggregate(
        total=Count('id'),
        low_stock=Count('id', filter=Q(current_stock__lte=F('minimum_stock'))),
        out_of_stock=Count('id', filter=Q(current_stock__lte=0)),
        expired=Count('id', filter=Q(expiry_date__lt=today)),
        expiring_soon=Count('id', filter=Q(
            expiry_date__gte=today,
            expiry_date__lte=today + timedelta(days=30)
        ))
    )
    
    # Get inventory categories with item counts
    inventory_categories = InventoryCategory.objects.annotate(
        item_count=Count('items')
    ).order_by('-item_count')
    
    # Critical alerts count
    critical_alerts = InventoryAlert.objects.filter(
        is_resolved=False,
        priority='critical'
    ).count()
    
    # Get recent activities efficiently
    recent_vaccination_submissions = VaccinationSubmission.objects.filter(
        created_at__gte=week_ago
    ).select_related('assigned_veterinarian').order_by('-created_at')[:5]
    
    recent_tool_usage = ToolUsageEvent.objects.filter(
        timestamp__gte=week_ago
    ).order_by('-timestamp')[:5]
    
    # Build recent activities
    recent_activities = []
    
    for submission in recent_vaccination_submissions:
        recent_activities.append({
            'icon': 'syringe',
            'description': f'New vaccination schedule: {submission.poultry_type.title()} - {submission.batch_name} from {submission.country or "Unknown"}',
            'timestamp': submission.created_at
        })
    
    for usage in recent_tool_usage:
        recent_activities.append({
            'icon': 'chart-line',
            'description': f'Tool usage: {usage.tool_name} - {usage.action} from {usage.country or "Unknown"}',
            'timestamp': usage.timestamp
        })
    
    # Sort activities by timestamp
    recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
    recent_activities = recent_activities[:10]
    
    context = {
        'title': 'Farm Operations Dashboard',
        
        # Optimized frontend data
        'total_vaccination_submissions': vaccination_stats['total'],
        'recent_submissions': vaccination_stats['recent'],
        'upcoming_arrivals': vaccination_stats['upcoming'],
        'overdue_arrivals': vaccination_stats['overdue'],
        'total_tool_usage': tool_usage_stats['total'],
        'vaccination_tool_usage': tool_usage_stats['vaccination'],
        'room_measurement_usage': tool_usage_stats['room_measurement'],
        'budget_calculator_usage': tool_usage_stats['budget_calculator'],
        
        # Veterinarian data
        'total_veterinarians': vet_stats['total_veterinarians'],
        'assigned_submissions': vet_stats['assigned_submissions'],
        
        # Inventory data
        'total_inventory_items': inventory_stats['total'],
        'low_stock_items': inventory_stats['low_stock'],
        'out_of_stock_items': inventory_stats['out_of_stock'],
        'expired_items': inventory_stats['expired'],
        'expiring_soon_items': inventory_stats['expiring_soon'],
        'inventory_categories': list(inventory_categories),
        'critical_alerts': critical_alerts,
        
        # Recent activities
        'recent_activities': recent_activities,
        'recent_vaccination_submissions': recent_vaccination_submissions,
        
        # Legacy data (for backward compatibility with template)
        'total_users': User.objects.count(),
        'total_operations': PoultryOperation.objects.count(),
        'total_vaccinations': VaccinationPlan.objects.count(),
        'pending_reminders': VaccinationReminder.objects.filter(status='pending').count(),
        'upcoming_vaccinations': VaccinationPlan.objects.filter(
            scheduled_date__gte=today,
            scheduled_date__lte=today + timedelta(days=7)
        ).count(),
        'recent_arrivals': PoultryOperation.objects.filter(
            arrival_date__gte=today - timedelta(days=30)
        ).count(),
        'total_vaccine_types': VaccinationTemplate.objects.count(),
        'farms_with_vets': vet_stats['assigned_submissions'],
        'sent_reminders': VaccinationReminder.objects.filter(
            is_sent=True, 
            sent_at__gte=today - timedelta(days=7)
        ).count(),
        
        'now': timezone.now(),
    }
    
    return render(request, 'admin/index.html', context)
