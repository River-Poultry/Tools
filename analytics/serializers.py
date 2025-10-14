from rest_framework import serializers
from .models import ToolUsageEvent, VaccinationSubmission, FrontendAnalytics
from users.models import User


class ToolUsageEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolUsageEvent
        fields = [
            'id', 'tool_name', 'user', 'session_id', 'timestamp', 'action',
            'metadata', 'country', 'region', 'city', 'timezone',
            'device_type', 'os', 'browser', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VaccinationSubmissionSerializer(serializers.ModelSerializer):
    days_until_arrival = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    assigned_veterinarian_name = serializers.SerializerMethodField()

    class Meta:
        model = VaccinationSubmission
        fields = [
            'id', 'user', 'session_id', 'poultry_type', 'arrival_date',
            'batch_name', 'batch_size', 'vaccination_schedule', 'total_vaccinations',
            'estimated_sale_date', 'farmer_name', 'farmer_email', 'farmer_phone',
            'farm_location', 'country', 'region', 'device_type', 'status',
            'assigned_veterinarian', 'assigned_veterinarian_name', 'assignment_date',
            'days_until_arrival', 'is_upcoming', 'is_overdue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'assigned_veterinarian_name']

    def get_assigned_veterinarian_name(self, obj):
        if obj.assigned_veterinarian:
            return obj.assigned_veterinarian.full_name or obj.assigned_veterinarian.username
        return None


class FrontendAnalyticsSerializer(serializers.ModelSerializer):
    total_tool_usage = serializers.ReadOnlyField()
    total_poultry_types = serializers.ReadOnlyField()

    class Meta:
        model = FrontendAnalytics
        fields = [
            'date', 'total_users', 'total_sessions', 'total_page_views',
            'vaccination_usage', 'room_measurement_usage', 'budget_calculator_usage',
            'pdf_downloads', 'calendar_integrations', 'broilers_count',
            'layers_count', 'sasso_kroilers_count', 'top_countries', 'top_regions',
            'mobile_usage', 'tablet_usage', 'desktop_usage', 'google_calendar',
            'outlook_calendar', 'apple_calendar', 'ics_downloads',
            'total_tool_usage', 'total_poultry_types', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class VaccinationSubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vaccination submissions from frontend"""
    class Meta:
        model = VaccinationSubmission
        fields = [
            'poultry_type', 'arrival_date', 'batch_name', 'batch_size',
            'vaccination_schedule', 'farmer_name', 'farmer_email', 'farmer_phone',
            'farm_location', 'country', 'region', 'device_type'
        ]

    def create(self, validated_data):
        import uuid
        from datetime import timedelta
        
        # Generate unique ID
        validated_data['id'] = f"vacc_sub_{uuid.uuid4().hex[:12]}"
        
        # Generate session ID if not provided
        if 'session_id' not in validated_data:
            validated_data['session_id'] = f"session_{uuid.uuid4().hex[:8]}"
        
        # Calculate total vaccinations
        vaccination_schedule = validated_data.get('vaccination_schedule', [])
        validated_data['total_vaccinations'] = len(vaccination_schedule)
        
        # Calculate estimated sale date based on poultry type
        arrival_date = validated_data['arrival_date']
        poultry_type = validated_data['poultry_type']
        
        # Use dictionary lookup for better performance
        days_to_sale_map = {
            'broilers': 42,
            'layers': 500,
            'sasso': 120,
            'kroilers': 120
        }
        days_to_sale = days_to_sale_map.get(poultry_type, 120)
        
        validated_data['estimated_sale_date'] = arrival_date + timedelta(days=days_to_sale)
        
        return super().create(validated_data)


class ToolUsageEventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tool usage events from frontend"""
    class Meta:
        model = ToolUsageEvent
        fields = [
            'tool_name', 'session_id', 'action', 'metadata',
            'country', 'region', 'city', 'timezone',
            'device_type', 'os', 'browser'
        ]

    def create(self, validated_data):
        import uuid
        
        # Generate unique ID
        validated_data['id'] = f"event_{uuid.uuid4().hex[:12]}"
        
        # Extract location and device info from metadata if not provided
        metadata = validated_data.get('metadata', {})
        location = metadata.get('location', {})
        device = metadata.get('device', {})
        
        # Use dictionary mapping for cleaner code
        location_mapping = {
            'country': location.get('country'),
            'region': location.get('region'),
            'city': location.get('city'),
            'timezone': location.get('timezone')
        }
        
        device_mapping = {
            'device_type': device.get('type'),
            'os': device.get('os'),
            'browser': device.get('browser')
        }
        
        # Update validated_data with extracted values
        for field, value in {**location_mapping, **device_mapping}.items():
            if not validated_data.get(field) and value:
                validated_data[field] = value
        
        return super().create(validated_data)

