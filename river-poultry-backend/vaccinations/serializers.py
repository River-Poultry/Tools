from rest_framework import serializers
from datetime import timedelta
from .models import VaccinationPlan, VaccinationTemplate, VaccinationReminder
from operations.models import PoultryOperation


class VaccinationReminderSerializer(serializers.ModelSerializer):
    """Serializer for VaccinationReminder model"""
    
    class Meta:
        model = VaccinationReminder
        fields = [
            'id', 'reminder_type', 'days_before', 'is_sent', 'sent_at', 
            'message', 'created_at'
        ]
        read_only_fields = ['id', 'is_sent', 'sent_at', 'created_at']


class VaccinationPlanSerializer(serializers.ModelSerializer):
    """Serializer for VaccinationPlan model"""
    is_overdue = serializers.ReadOnlyField()
    days_until_due = serializers.ReadOnlyField()
    operation_name = serializers.CharField(source='operation.operation_name', read_only=True)
    poultry_type = serializers.CharField(source='operation.poultry_type', read_only=True)
    reminders = VaccinationReminderSerializer(many=True, read_only=True)
    
    class Meta:
        model = VaccinationPlan
        fields = [
            'id', 'operation', 'operation_name', 'poultry_type', 'vaccine_name',
            'scheduled_date', 'age_days', 'route', 'dosage', 'notes', 'status',
            'completed_at', 'completed_by', 'actual_dosage_used', 'completion_notes',
            'rescheduled_from', 'reschedule_reason', 'is_overdue', 'days_until_due',
            'reminders', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'is_overdue', 'days_until_due', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Create new vaccination plan"""
        validated_data['operation'] = self.context['operation']
        return super().create(validated_data)


class VaccinationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for VaccinationTemplate model"""
    
    class Meta:
        model = VaccinationTemplate
        fields = [
            'id', 'poultry_type', 'vaccine_name', 'age_days', 'route', 
            'dosage', 'notes', 'is_required', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VaccinationCompletionSerializer(serializers.ModelSerializer):
    """Serializer for marking vaccinations as completed"""
    
    class Meta:
        model = VaccinationPlan
        fields = ['completed_by', 'actual_dosage_used', 'completion_notes']
    
    def update(self, instance, validated_data):
        """Mark vaccination as completed"""
        instance.mark_completed(
            completed_by=validated_data.get('completed_by'),
            actual_dosage=validated_data.get('actual_dosage_used'),
            notes=validated_data.get('completion_notes')
        )
        return instance


class VaccinationScheduleSerializer(serializers.Serializer):
    """Serializer for generating vaccination schedules"""
    operation = serializers.PrimaryKeyRelatedField(queryset=PoultryOperation.objects.all())
    poultry_type = serializers.CharField()
    start_date = serializers.DateField()
    
    def create(self, validated_data):
        """Generate vaccination schedule from templates"""
        operation = validated_data['operation']
        start_date = validated_data['start_date']
        poultry_type = validated_data['poultry_type']
        
        # Get templates for this poultry type
        templates = VaccinationTemplate.objects.filter(
            poultry_type=poultry_type, 
            is_active=True
        ).order_by('age_days')
        
        vaccination_plans = []
        for template in templates:
            scheduled_date = start_date + timedelta(days=template.age_days)
            plan = VaccinationPlan.objects.create(
                operation=operation,
                vaccine_name=template.vaccine_name,
                scheduled_date=scheduled_date,
                age_days=template.age_days,
                route=template.route,
                dosage=template.dosage,
                notes=template.notes
            )
            vaccination_plans.append(plan)
        
        return vaccination_plans


class VaccinationStatsSerializer(serializers.Serializer):
    """Serializer for vaccination statistics"""
    total_vaccinations = serializers.IntegerField()
    completed_vaccinations = serializers.IntegerField()
    pending_vaccinations = serializers.IntegerField()
    overdue_vaccinations = serializers.IntegerField()
    upcoming_vaccinations = serializers.IntegerField()
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
