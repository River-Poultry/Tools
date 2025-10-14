from django.contrib import admin
from .models import PoultryOperation, OperationMetrics
from users.admin_mixins import RoleBasedAdminMixin


class OperationMetricsInline(admin.TabularInline):
    """Inline admin for OperationMetrics"""
    model = OperationMetrics
    extra = 0
    readonly_fields = ('total_costs', 'profit', 'profit_margin')


@admin.register(PoultryOperation)
class PoultryOperationAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for PoultryOperation model"""
    list_display = ('operation_name', 'user', 'poultry_type', 'batch_name', 
                    'number_of_birds', 'current_age_days', 'status', 'arrival_date', 'expected_sale_date')
    list_filter = ('poultry_type', 'status', 'breed', 'arrival_date', 'created_at')
    search_fields = ('operation_name', 'batch_name', 'breed', 'source', 'user__username')
    raw_id_fields = ('user',)
    inlines = [OperationMetricsInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'operation_name', 'poultry_type', 'batch_name', 'status')
        }),
        ('Bird Details', {
            'fields': ('number_of_birds', 'current_age_days', 'breed', 'source')
        }),
        ('Dates', {
            'fields': ('arrival_date', 'expected_sale_date')
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('current_age_days',)


@admin.register(OperationMetrics)
class OperationMetricsAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for OperationMetrics model"""
    list_display = ('operation', 'mortality_rate', 'total_costs', 'total_revenue', 'profit', 'profit_margin')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('operation__operation_name', 'operation__user__username')
    raw_id_fields = ('operation',)
    readonly_fields = ('total_costs', 'profit', 'profit_margin')
