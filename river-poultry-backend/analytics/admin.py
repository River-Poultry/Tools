from django.contrib import admin
from .models import ToolUsageEvent, VaccinationSubmission, FrontendAnalytics
from users.admin_mixins import RoleBasedAdminMixin


@admin.register(ToolUsageEvent)
class ToolUsageEventAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for ToolUsageEvent model"""
    list_display = ('id', 'tool_name', 'action', 'country', 'device_type', 'timestamp')
    list_filter = ('tool_name', 'action', 'country', 'device_type', 'timestamp')
    search_fields = ('id', 'session_id', 'country', 'city')
    readonly_fields = ('id', 'timestamp', 'created_at', 'updated_at')
    ordering = ('-timestamp',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'tool_name', 'action', 'session_id', 'timestamp')
        }),
        ('User Information', {
            'fields': ('user',)
        }),
        ('Location Data', {
            'fields': ('country', 'region', 'city', 'timezone')
        }),
        ('Device Information', {
            'fields': ('device_type', 'os', 'browser')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(VaccinationSubmission)
class VaccinationSubmissionAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for VaccinationSubmission model"""
    list_display = ('id', 'poultry_type', 'batch_name', 'arrival_date', 'status', 'assigned_veterinarian', 'country')
    list_filter = ('poultry_type', 'status', 'country', 'assigned_veterinarian', 'arrival_date')
    search_fields = ('id', 'batch_name', 'farmer_name', 'farmer_email', 'farm_location')
    readonly_fields = ('id', 'total_vaccinations', 'estimated_sale_date', 'days_until_arrival', 'is_upcoming', 'is_overdue', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'poultry_type', 'arrival_date', 'batch_name', 'batch_size')
        }),
        ('Vaccination Schedule', {
            'fields': ('vaccination_schedule', 'total_vaccinations', 'estimated_sale_date')
        }),
        ('Farmer Information', {
            'fields': ('farmer_name', 'farmer_email', 'farmer_phone', 'farm_location')
        }),
        ('Assignment', {
            'fields': ('status', 'assigned_veterinarian', 'assignment_date')
        }),
        ('Analytics', {
            'fields': ('country', 'region', 'device_type', 'session_id')
        }),
        ('Status Information', {
            'fields': ('days_until_arrival', 'is_upcoming', 'is_overdue'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter submissions based on user permissions"""
        qs = super().get_queryset(request)
        if request.user.has_super_admin_access():
            return qs
        elif request.user.admin_role == 'veterinarian':
            return qs.filter(assigned_veterinarian=request.user)
        else:
            return qs.none()


@admin.register(FrontendAnalytics)
class FrontendAnalyticsAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for FrontendAnalytics model"""
    list_display = ('date', 'total_users', 'total_sessions', 'vaccination_usage', 'total_tool_usage')
    list_filter = ('date',)
    search_fields = ('date',)
    readonly_fields = ('total_tool_usage', 'total_poultry_types', 'created_at', 'updated_at')
    ordering = ('-date',)
    
    fieldsets = (
        ('Date', {
            'fields': ('date',)
        }),
        ('User Statistics', {
            'fields': ('total_users', 'total_sessions', 'total_page_views')
        }),
        ('Tool Usage', {
            'fields': ('vaccination_usage', 'room_measurement_usage', 'budget_calculator_usage', 'pdf_downloads', 'calendar_integrations')
        }),
        ('Poultry Type Popularity', {
            'fields': ('broilers_count', 'layers_count', 'sasso_kroilers_count')
        }),
        ('Geographic Data', {
            'fields': ('top_countries', 'top_regions'),
            'classes': ('collapse',)
        }),
        ('Device Statistics', {
            'fields': ('mobile_usage', 'tablet_usage', 'desktop_usage')
        }),
        ('Calendar Platform Usage', {
            'fields': ('google_calendar', 'outlook_calendar', 'apple_calendar', 'ics_downloads')
        }),
        ('Calculated Fields', {
            'fields': ('total_tool_usage', 'total_poultry_types'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
