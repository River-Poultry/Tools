from django.contrib import admin
from .models import VaccinationPlan, VaccinationTemplate, VaccinationReminder
from users.admin_mixins import RoleBasedAdminMixin


class VaccinationReminderInline(admin.TabularInline):
    """Inline admin for VaccinationReminder"""
    model = VaccinationReminder
    extra = 0


@admin.register(VaccinationPlan)
class VaccinationPlanAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for VaccinationPlan model"""
    list_display = ('vaccine_name', 'operation', 'scheduled_date', 'age_days', 
                    'route', 'status', 'is_overdue', 'completed_at')
    list_filter = ('status', 'route', 'scheduled_date', 'operation__poultry_type', 'created_at')
    search_fields = ('vaccine_name', 'operation__operation_name', 'operation__user__username')
    raw_id_fields = ('operation', 'rescheduled_from')
    inlines = [VaccinationReminderInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('operation', 'vaccine_name', 'scheduled_date', 'age_days', 'route', 'dosage')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Completion', {
            'fields': ('completed_at', 'completed_by', 'actual_dosage_used', 'completion_notes'),
            'classes': ('collapse',)
        }),
        ('Rescheduling', {
            'fields': ('rescheduled_from', 'reschedule_reason'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('is_overdue', 'days_until_due')


@admin.register(VaccinationTemplate)
class VaccinationTemplateAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for VaccinationTemplate model"""
    list_display = ('poultry_type', 'vaccine_name', 'age_days', 'route', 'is_required', 'is_active')
    list_filter = ('poultry_type', 'is_required', 'is_active', 'route')
    search_fields = ('vaccine_name', 'notes')
    ordering = ('poultry_type', 'age_days')


@admin.register(VaccinationReminder)
class VaccinationReminderAdmin(RoleBasedAdminMixin, admin.ModelAdmin):
    """Admin for VaccinationReminder model"""
    list_display = ('vaccination_plan', 'reminder_type', 'days_before', 'is_sent', 'sent_at')
    list_filter = ('reminder_type', 'is_sent', 'created_at')
    search_fields = ('vaccination_plan__vaccine_name', 'message')
    raw_id_fields = ('vaccination_plan',)
