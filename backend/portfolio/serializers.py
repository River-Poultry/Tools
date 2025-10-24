from rest_framework import serializers
from .models import Portfolio, Investment, Transaction, MSME, BusinessGrowthExpert, SupportRequest, TrainingSession, Attendance, TrainingTopic

class PortfolioSerializer(serializers.ModelSerializer):
    total_value = serializers.ReadOnlyField()
    total_cost = serializers.ReadOnlyField()
    total_return = serializers.ReadOnlyField()
    total_return_percentage = serializers.ReadOnlyField()
    investment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = '__all__'
    
    def get_investment_count(self, obj):
        return obj.investments.count()

class InvestmentSerializer(serializers.ModelSerializer):
    current_value = serializers.ReadOnlyField()
    total_cost = serializers.ReadOnlyField()
    total_return = serializers.ReadOnlyField()
    total_return_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Investment
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class MSMESerializer(serializers.ModelSerializer):
    class Meta:
        model = MSME
        fields = '__all__'

class BusinessGrowthExpertSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessGrowthExpert
        fields = '__all__'

class SupportRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = '__all__'

class TrainingTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingTopic
        fields = '__all__'

class TrainingSessionSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    attendance_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = '__all__'
    
    def get_attendance_count(self, obj):
        return obj.attendances.filter(present=True).count()

class AttendanceSerializer(serializers.ModelSerializer):
    msme_name = serializers.CharField(source='msme.business_name', read_only=True)
    session_title = serializers.CharField(source='session.title', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__' 