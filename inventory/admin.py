from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse, path
from django.utils.safestring import mark_safe
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import redirect
from .models import (
    InventoryCategory, InventoryItem, InventoryTransaction, 
    InventoryAlert, Supplier
)
from .views import inventory_dashboard
from users.admin_mixins import RoleBasedAdminMixin


@admin.register(InventoryCategory)
class InventoryCategoryAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for InventoryCategory model"""
    list_display = ('name', 'description', 'item_count', 'color_preview')
    list_filter = ('name',)
    search_fields = ('name', 'description')
    ordering = ('name',)
    
    def item_count(self, obj):
        """Show number of items in this category"""
        return obj.items.count()
    item_count.short_description = 'Items Count'
    
    def color_preview(self, obj):
        """Show color preview"""
        return format_html(
            '<div style="width: 20px; height: 20px; background-color: {}; border: 1px solid #ccc; display: inline-block;"></div>',
            obj.color
        )
    color_preview.short_description = 'Color'


class InventoryTransactionInline(admin.TabularInline):
    """Inline admin for InventoryTransaction"""
    model = InventoryTransaction
    extra = 0
    readonly_fields = ('stock_before', 'stock_after', 'total_cost', 'created_at')
    fields = ('transaction_type', 'quantity', 'unit_cost', 'total_cost', 'reference_number', 'supplier', 'notes', 'performed_by', 'transaction_date', 'stock_before', 'stock_after')


@admin.register(InventoryItem)
class InventoryItemAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Enhanced Admin for InventoryItem model with professional UI"""
    list_display = ('name', 'category', 'current_stock', 'unit', 'stock_status_badge', 'expiry_status', 'is_critical', 'status', 'quick_actions')
    list_filter = ('category', 'status', 'is_critical', 'unit', 'expiry_date', 'created_at')
    search_fields = ('name', 'description', 'manufacturer', 'batch_number', 'storage_location')
    raw_id_fields = ('created_by',)
    inlines = [InventoryTransactionInline]
    list_per_page = 25
    list_select_related = ('category', 'created_by')
    # Using default Django admin templates for consistency
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description', 'manufacturer', 'batch_number'),
            'classes': ('wide',)
        }),
        ('Inventory Details', {
            'fields': ('current_stock', 'minimum_stock', 'maximum_stock', 'unit', 'status', 'is_critical'),
            'classes': ('wide',)
        }),
        ('Pricing & Storage', {
            'fields': ('unit_cost', 'selling_price', 'storage_location', 'storage_conditions'),
            'classes': ('wide',)
        }),
        ('Dates & Tracking', {
            'fields': ('expiry_date', 'last_restocked'),
            'classes': ('wide',)
        }),
        ('Usage Information', {
            'fields': ('usage_instructions', 'contraindications'),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
    
    def stock_status_badge(self, obj):
        """Display stock status with professional badges"""
        status = obj.stock_status
        if status == 'out_of_stock':
            return format_html(
                '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OUT OF STOCK</span>'
            )
        elif status == 'low_stock':
            return format_html(
                '<span style="background: #ffc107; color: #212529; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">LOW STOCK</span>'
            )
        elif status == 'expired':
            return format_html(
                '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">EXPIRED</span>'
            )
        elif status == 'expiring_soon':
            return format_html(
                '<span style="background: #fd7e14; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">EXPIRING SOON</span>'
            )
        else:
            return format_html(
                '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">GOOD</span>'
            )
    stock_status_badge.short_description = 'Stock Status'
    stock_status_badge.admin_order_field = 'current_stock'
    
    def expiry_status(self, obj):
        """Display expiry status with color coding"""
        if not obj.expiry_date:
            return format_html('<span style="color: #6c757d;">No expiry date</span>')
        
        days_until_expiry = (obj.expiry_date - timezone.now().date()).days
        
        if days_until_expiry < 0:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">Expired {} days ago</span>',
                abs(days_until_expiry)
            )
        elif days_until_expiry <= 30:
            return format_html(
                '<span style="color: #fd7e14; font-weight: bold;">Expires in {} days</span>',
                days_until_expiry
            )
        else:
            return format_html(
                '<span style="color: #28a745;">Expires in {} days</span>',
                days_until_expiry
            )
    expiry_status.short_description = 'Expiry Status'
    expiry_status.admin_order_field = 'expiry_date'
    
    def quick_actions(self, obj):
        """Quick action buttons"""
        return format_html(
            '<a href="{}" style="background: #2E7D32; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; margin-right: 4px;">View</a>'
            '<a href="{}" style="background: #1B5E20; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px;">Edit</a>',
            reverse('admin:inventory_inventoryitem_change', args=[obj.pk]),
            reverse('admin:inventory_inventoryitem_change', args=[obj.pk])
        )
    quick_actions.short_description = 'Actions'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related('category', 'created_by')


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for InventoryTransaction model"""
    list_display = ('item', 'transaction_type', 'quantity', 'unit_cost', 'total_cost', 'performed_by', 'transaction_date')
    list_filter = ('transaction_type', 'transaction_date', 'item__category')
    search_fields = ('item__name', 'reference_number', 'supplier', 'customer', 'notes')
    raw_id_fields = ('item', 'performed_by')
    readonly_fields = ('stock_before', 'stock_after', 'total_cost', 'created_at')
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('item', 'transaction_type', 'quantity', 'unit_cost', 'total_cost')
        }),
        ('Reference Information', {
            'fields': ('reference_number', 'supplier', 'customer')
        }),
        ('Stock Levels', {
            'fields': ('stock_before', 'stock_after'),
            'classes': ('collapse',)
        }),
        ('Notes & Tracking', {
            'fields': ('notes', 'performed_by', 'transaction_date', 'created_at')
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related('item', 'performed_by')


@admin.register(InventoryAlert)
class InventoryAlertAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Enhanced Admin for InventoryAlert model with professional UI"""
    list_display = ('item', 'alert_type_badge', 'priority_badge', 'status_badge', 'created_at', 'resolved_by', 'quick_actions')
    list_filter = ('alert_type', 'priority', 'is_resolved', 'created_at')
    search_fields = ('item__name', 'message', 'resolved_notes')
    raw_id_fields = ('item', 'created_by', 'resolved_by')
    readonly_fields = ('created_at', 'resolved_at')
    list_per_page = 25
    
    fieldsets = (
        ('Alert Information', {
            'fields': ('item', 'alert_type', 'priority', 'message'),
            'classes': ('wide',)
        }),
        ('Resolution', {
            'fields': ('is_resolved', 'resolved_by', 'resolved_at', 'resolved_notes'),
            'classes': ('wide',)
        }),
        ('Tracking', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def alert_type_badge(self, obj):
        """Display alert type with color coding"""
        colors = {
            'low_stock': '#ffc107',
            'out_of_stock': '#dc3545',
            'expiring_soon': '#fd7e14',
            'expired': '#6c757d',
            'overstock': '#17a2b8'
        }
        color = colors.get(obj.alert_type, '#6c757d')
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color, obj.get_alert_type_display().upper()
        )
    alert_type_badge.short_description = 'Alert Type'
    alert_type_badge.admin_order_field = 'alert_type'
    
    def priority_badge(self, obj):
        """Display priority with color coding"""
        colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'critical': '#dc3545'
        }
        color = colors.get(obj.priority, '#6c757d')
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color, obj.get_priority_display().upper()
        )
    priority_badge.short_description = 'Priority'
    priority_badge.admin_order_field = 'priority'
    
    def status_badge(self, obj):
        """Display resolution status"""
        if obj.is_resolved:
            return format_html(
                '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">RESOLVED</span>'
            )
        else:
            return format_html(
                '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span>'
            )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_resolved'
    
    def quick_actions(self, obj):
        """Quick action buttons"""
        if not obj.is_resolved:
            return format_html(
                '<a href="{}" style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; margin-right: 4px;">Resolve</a>'
                '<a href="{}" style="background: #2E7D32; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px;">View</a>',
                reverse('admin:inventory_inventoryalert_change', args=[obj.pk]),
                reverse('admin:inventory_inventoryalert_change', args=[obj.pk])
            )
        else:
            return format_html(
                '<a href="{}" style="background: #2E7D32; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px;">View</a>',
                reverse('admin:inventory_inventoryalert_change', args=[obj.pk])
            )
    quick_actions.short_description = 'Actions'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related('item', 'created_by', 'resolved_by')


@admin.register(Supplier)
class SupplierAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for Supplier model"""
    list_display = ('name', 'contact_person', 'email', 'phone', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'contact_person', 'email', 'phone')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'contact_person', 'email', 'phone', 'address', 'website')
        }),
        ('Business Information', {
            'fields': ('tax_id', 'payment_terms', 'delivery_terms')
        }),
        ('Status & Notes', {
            'fields': ('is_active', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


# Models are now registered with the main admin site using @admin.register decorators above
