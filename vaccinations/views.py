from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import VaccinationPlan, VaccinationTemplate, VaccinationReminder
from operations.models import PoultryOperation
from .serializers import (
    VaccinationPlanSerializer, VaccinationTemplateSerializer,
    VaccinationCompletionSerializer, VaccinationScheduleSerializer,
    VaccinationStatsSerializer, VaccinationReminderSerializer
)
from .reminder_service import VaccinationReminderService


class VaccinationPlanListCreateView(generics.ListCreateAPIView):
    """List and create vaccination plans"""
    serializer_class = VaccinationPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'route', 'operation__poultry_type']
    search_fields = ['vaccine_name', 'operation__operation_name']
    ordering_fields = ['scheduled_date', 'age_days', 'created_at']
    ordering = ['scheduled_date']
    
    def get_queryset(self):
        return VaccinationPlan.objects.filter(operation__user=self.request.user)


class VaccinationPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific vaccination plan"""
    serializer_class = VaccinationPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return VaccinationPlan.objects.filter(operation__user=self.request.user)


class VaccinationTemplateListView(generics.ListAPIView):
    """List vaccination templates by poultry type"""
    serializer_class = VaccinationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['poultry_type', 'is_required', 'is_active']
    search_fields = ['vaccine_name']
    ordering = ['poultry_type', 'age_days']
    
    def get_queryset(self):
        return VaccinationTemplate.objects.filter(is_active=True)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_vaccination_schedule(request):
    """Generate vaccination schedule for an operation"""
    serializer = VaccinationScheduleSerializer(data=request.data)
    if serializer.is_valid():
        operation_id = serializer.validated_data['operation'].id
        operation = PoultryOperation.objects.get(id=operation_id, user=request.user)
        
        # Generate schedule
        vaccination_plans = serializer.save()
        
        return Response({
            'message': f'Vaccination schedule generated for {len(vaccination_plans)} vaccinations',
            'vaccination_plans': VaccinationPlanSerializer(vaccination_plans, many=True).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_vaccination(request, vaccination_id):
    """Mark a vaccination as completed"""
    try:
        vaccination = VaccinationPlan.objects.get(
            id=vaccination_id, 
            operation__user=request.user
        )
        
        serializer = VaccinationCompletionSerializer(vaccination, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Vaccination marked as completed',
                'vaccination': VaccinationPlanSerializer(vaccination).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except VaccinationPlan.DoesNotExist:
        return Response({
            'error': 'Vaccination plan not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_vaccinations(request):
    """Get upcoming vaccinations for the user"""
    user = request.user
    today = timezone.now().date()
    
    # Get vaccinations due in next 7 days
    upcoming = VaccinationPlan.objects.filter(
        operation__user=user,
        status='scheduled',
        scheduled_date__gte=today,
        scheduled_date__lte=today + timedelta(days=7)
    ).order_by('scheduled_date')
    
    serializer = VaccinationPlanSerializer(upcoming, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def overdue_vaccinations(request):
    """Get overdue vaccinations for the user"""
    user = request.user
    today = timezone.now().date()
    
    overdue = VaccinationPlan.objects.filter(
        operation__user=user,
        status='scheduled',
        scheduled_date__lt=today
    ).order_by('scheduled_date')
    
    serializer = VaccinationPlanSerializer(overdue, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vaccination_stats(request):
    """Get vaccination statistics for the user"""
    user = request.user
    
    # Get basic counts
    total_vaccinations = VaccinationPlan.objects.filter(operation__user=user).count()
    completed_vaccinations = VaccinationPlan.objects.filter(
        operation__user=user, 
        status='completed'
    ).count()
    pending_vaccinations = VaccinationPlan.objects.filter(
        operation__user=user, 
        status='scheduled'
    ).count()
    overdue_vaccinations = VaccinationPlan.objects.filter(
        operation__user=user,
        status='scheduled',
        scheduled_date__lt=timezone.now().date()
    ).count()
    
    # Get upcoming vaccinations (next 7 days)
    upcoming_vaccinations = VaccinationPlan.objects.filter(
        operation__user=user,
        status='scheduled',
        scheduled_date__gte=timezone.now().date(),
        scheduled_date__lte=timezone.now().date() + timedelta(days=7)
    ).count()
    
    # Calculate completion rate
    completion_rate = (completed_vaccinations / total_vaccinations * 100) if total_vaccinations > 0 else 0
    
    stats = {
        'total_vaccinations': total_vaccinations,
        'completed_vaccinations': completed_vaccinations,
        'pending_vaccinations': pending_vaccinations,
        'overdue_vaccinations': overdue_vaccinations,
        'upcoming_vaccinations': upcoming_vaccinations,
        'completion_rate': round(completion_rate, 2)
    }
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reschedule_vaccination(request, vaccination_id):
    """Reschedule a vaccination"""
    try:
        vaccination = VaccinationPlan.objects.get(
            id=vaccination_id, 
            operation__user=request.user
        )
        
        new_date = request.data.get('scheduled_date')
        reason = request.data.get('reschedule_reason', '')
        
        if new_date:
            # Create new vaccination plan
            new_vaccination = VaccinationPlan.objects.create(
                operation=vaccination.operation,
                vaccine_name=vaccination.vaccine_name,
                scheduled_date=new_date,
                age_days=vaccination.age_days,
                route=vaccination.route,
                dosage=vaccination.dosage,
                notes=vaccination.notes,
                rescheduled_from=vaccination,
                reschedule_reason=reason
            )
            
            # Mark original as rescheduled
            vaccination.status = 'rescheduled'
            vaccination.save()
            
            return Response({
                'message': 'Vaccination rescheduled successfully',
                'new_vaccination': VaccinationPlanSerializer(new_vaccination).data
            })
        else:
            return Response({
                'error': 'scheduled_date is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except VaccinationPlan.DoesNotExist:
        return Response({
            'error': 'Vaccination plan not found'
        }, status=status.HTTP_404_NOT_FOUND)


# Reminder-related API endpoints

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_reminder_schedule(request, vaccination_id):
    """Create reminder schedule for a vaccination plan"""
    try:
        vaccination = VaccinationPlan.objects.get(
            id=vaccination_id,
            operation__user=request.user
        )
        
        reminder_service = VaccinationReminderService()
        reminders = reminder_service.create_reminder_schedule(vaccination)
        
        return Response({
            'message': f'Created {len(reminders)} reminder schedules',
            'reminders': VaccinationReminderSerializer(reminders, many=True).data
        })
        
    except VaccinationPlan.DoesNotExist:
        return Response({
            'error': 'Vaccination plan not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_reminder_schedule(request, vaccination_id):
    """Get reminder schedule for a vaccination plan"""
    try:
        vaccination = VaccinationPlan.objects.get(
            id=vaccination_id,
            operation__user=request.user
        )
        
        reminders = VaccinationReminder.objects.filter(
            vaccination_plan=vaccination
        ).order_by('days_before')
        
        return Response({
            'vaccination': VaccinationPlanSerializer(vaccination).data,
            'reminders': VaccinationReminderSerializer(reminders, many=True).data
        })
        
    except VaccinationPlan.DoesNotExist:
        return Response({
            'error': 'Vaccination plan not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_test_reminder(request, vaccination_id):
    """Send a test reminder for a vaccination plan"""
    try:
        vaccination = VaccinationPlan.objects.get(
            id=vaccination_id,
            operation__user=request.user
        )
        
        reminder_service = VaccinationReminderService()
        
        # Create a test reminder
        test_reminder = VaccinationReminder.objects.create(
            vaccination_plan=vaccination,
            reminder_type='push',
            days_before=0,  # Day of vaccination
            status='pending',
            message=f"Test reminder for {vaccination.vaccine_name}"
        )
        
        # Send the test reminder
        success = reminder_service.send_reminder(test_reminder)
        
        if success:
            return Response({
                'message': 'Test reminder sent successfully',
                'reminder': VaccinationReminderSerializer(test_reminder).data
            })
        else:
            return Response({
                'error': 'Failed to send test reminder'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except VaccinationPlan.DoesNotExist:
        return Response({
            'error': 'Vaccination plan not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_upcoming_reminders(request):
    """Get upcoming reminders for the user's operations"""
    user_operations = PoultryOperation.objects.filter(user=request.user)
    
    # Get reminders for the next 7 days
    end_date = timezone.now().date() + timedelta(days=7)
    
    reminders = VaccinationReminder.objects.filter(
        vaccination_plan__operation__in=user_operations,
        vaccination_plan__scheduled_date__lte=end_date,
        status='pending'
    ).select_related('vaccination_plan', 'vaccination_plan__operation').order_by('vaccination_plan__scheduled_date')
    
    return Response({
        'reminders': VaccinationReminderSerializer(reminders, many=True).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_reminder_stats(request):
    """Get reminder statistics for the user's operations"""
    user_operations = PoultryOperation.objects.filter(user=request.user)
    
    # Get reminder statistics
    total_reminders = VaccinationReminder.objects.filter(
        vaccination_plan__operation__in=user_operations
    ).count()
    
    pending_reminders = VaccinationReminder.objects.filter(
        vaccination_plan__operation__in=user_operations,
        status='pending'
    ).count()
    
    sent_reminders = VaccinationReminder.objects.filter(
        vaccination_plan__operation__in=user_operations,
        status='sent'
    ).count()
    
    failed_reminders = VaccinationReminder.objects.filter(
        vaccination_plan__operation__in=user_operations,
        status='failed'
    ).count()
    
    # Get upcoming vaccinations
    upcoming_vaccinations = VaccinationPlan.objects.filter(
        operation__in=user_operations,
        status='scheduled',
        scheduled_date__gte=timezone.now().date()
    ).order_by('scheduled_date')[:5]
    
    return Response({
        'reminder_stats': {
            'total': total_reminders,
            'pending': pending_reminders,
            'sent': sent_reminders,
            'failed': failed_reminders
        },
        'upcoming_vaccinations': VaccinationPlanSerializer(upcoming_vaccinations, many=True).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def process_all_reminders(request):
    """Process all due reminders (Admin only)"""
    reminder_service = VaccinationReminderService()
    summary = reminder_service.process_all_due_reminders()
    
    return Response({
        'message': 'Reminder processing completed',
        'summary': summary
    })
