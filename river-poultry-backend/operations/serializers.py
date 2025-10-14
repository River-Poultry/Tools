from rest_framework import serializers
from .models import PoultryOperation, OperationMetrics


class OperationMetricsSerializer(serializers.ModelSerializer):
    """Serializer for OperationMetrics model"""
    total_costs = serializers.ReadOnlyField()
    profit = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    
    class Meta:
        model = OperationMetrics
        fields = [
            'id', 'mortality_rate', 'feed_conversion_ratio', 'average_daily_gain',
            'total_feed_cost', 'total_medication_cost', 'total_labor_cost', 
            'total_other_costs', 'total_costs', 'total_revenue', 'average_sale_price',
            'profit', 'profit_margin', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PoultryOperationSerializer(serializers.ModelSerializer):
    """Serializer for PoultryOperation model"""
    current_age_weeks = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    metrics = OperationMetricsSerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = PoultryOperation
        fields = [
            'id', 'user', 'operation_name', 'poultry_type', 'batch_name',
            'arrival_date', 'expected_sale_date', 'number_of_birds', 
            'current_age_days', 'current_age_weeks', 'status', 'breed', 
            'source', 'notes', 'days_remaining', 'is_overdue', 'metrics',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'current_age_days', 'current_age_weeks', 'days_remaining', 
            'is_overdue', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Create new operation with current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class OperationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new operations"""
    
    class Meta:
        model = PoultryOperation
        fields = [
            'operation_name', 'poultry_type', 'batch_name', 'arrival_date',
            'expected_sale_date', 'number_of_birds', 'breed', 'source', 'notes'
        ]
    
    def create(self, validated_data):
        """Create new operation"""
        validated_data['user'] = self.context['request'].user
        operation = PoultryOperation.objects.create(**validated_data)
        # Create associated metrics
        OperationMetrics.objects.create(operation=operation)
        return operation


class OperationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating operations"""
    
    class Meta:
        model = PoultryOperation
        fields = [
            'operation_name', 'poultry_type', 'batch_name', 'arrival_date',
            'expected_sale_date', 'number_of_birds', 'current_age_days',
            'status', 'breed', 'source', 'notes'
        ]
        read_only_fields = ['current_age_days']


class OperationStatsSerializer(serializers.Serializer):
    """Serializer for operation statistics"""
    total_operations = serializers.IntegerField()
    active_operations = serializers.IntegerField()
    completed_operations = serializers.IntegerField()
    total_birds = serializers.IntegerField()
    average_mortality_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_costs = serializers.DecimalField(max_digits=10, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=10, decimal_places=2)




