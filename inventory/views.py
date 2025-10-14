from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, F
from django.utils import timezone
from .models import InventoryItem, InventoryCategory, InventoryAlert, InventoryTransaction


@staff_member_required
def inventory_dashboard(request):
    """Dashboard view for inventory management"""
    context = {
        'total_items': InventoryItem.objects.count(),
        'low_stock_items': InventoryItem.objects.filter(current_stock__lte=F('minimum_stock')).count(),
        'out_of_stock_items': InventoryItem.objects.filter(current_stock=0).count(),
        'expiring_soon': InventoryItem.objects.filter(
            expiry_date__lte=timezone.now().date() + timezone.timedelta(days=30)
        ).count(),
        'categories': InventoryCategory.objects.annotate(item_count=Count('items')),
        'recent_transactions': InventoryTransaction.objects.select_related('item', 'performed_by').order_by('-created_at')[:10],
        'active_alerts': InventoryAlert.objects.filter(is_resolved=False).select_related('item')[:5],
    }
    return render(request, 'admin/inventory/dashboard.html', context)
