from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta, date
from .models import ToolUsageEvent, VaccinationSubmission, FrontendAnalytics
from .serializers import (
    ToolUsageEventSerializer, VaccinationSubmissionSerializer, 
    FrontendAnalyticsSerializer, VaccinationSubmissionCreateSerializer,
    ToolUsageEventCreateSerializer
)
from users.models import User


class ToolUsageEventListCreateView(generics.ListCreateAPIView):
    """List and create tool usage events"""
    queryset = ToolUsageEvent.objects.all()
    permission_classes = [AllowAny]  # Allow frontend to submit data
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ToolUsageEventCreateSerializer
        return ToolUsageEventSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(timestamp__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__date__lte=end_date)
            
        # Filter by tool
        tool_name = self.request.query_params.get('tool_name')
        if tool_name:
            queryset = queryset.filter(tool_name=tool_name)
            
        # Filter by country
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(country__icontains=country)
            
        return queryset


class VaccinationSubmissionListCreateView(generics.ListCreateAPIView):
    """List and create vaccination submissions"""
    queryset = VaccinationSubmission.objects.all()
    permission_classes = [AllowAny]  # Allow frontend to submit data
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VaccinationSubmissionCreateSerializer
        return VaccinationSubmissionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        # Filter by poultry type
        poultry_type = self.request.query_params.get('poultry_type')
        if poultry_type:
            queryset = queryset.filter(poultry_type=poultry_type)
            
        # Filter by country
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(country__icontains=country)
            
        # Filter by veterinarian
        vet_id = self.request.query_params.get('veterinarian')
        if vet_id:
            queryset = queryset.filter(assigned_veterinarian_id=vet_id)
            
        return queryset


class FrontendAnalyticsListView(generics.ListAPIView):
    """List frontend analytics data"""
    queryset = FrontendAnalytics.objects.all()
    serializer_class = FrontendAnalyticsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_vaccination_schedule(request):
    """Submit vaccination schedule from frontend"""
    serializer = VaccinationSubmissionCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        submission = serializer.save()
        
        # Create corresponding tool usage event
        ToolUsageEvent.objects.create(
            id=f"event_{submission.id}",
            tool_name='vaccination',
            session_id=submission.session_id,
            action='calculate',
            metadata={
                'poultry_type': submission.poultry_type,
                'batch_size': submission.batch_size,
                'total_vaccinations': submission.total_vaccinations,
                'submission_id': submission.id
            },
            country=submission.country,
            region=submission.region,
            device_type=submission.device_type
        )
        
        return Response({
            'success': True,
            'submission_id': submission.id,
            'message': 'Vaccination schedule submitted successfully'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_tool_usage(request):
    """Track tool usage from frontend"""
    serializer = ToolUsageEventCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Tool usage tracked successfully'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    """Get dashboard metrics for admin panel"""
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    last_7_days = today - timedelta(days=7)
    
    # Get vaccination submissions
    total_submissions = VaccinationSubmission.objects.count()
    recent_submissions = VaccinationSubmission.objects.filter(
        created_at__date__gte=last_7_days
    ).count()
    
    # Get upcoming arrivals (next 30 days)
    upcoming_arrivals = VaccinationSubmission.objects.filter(
        arrival_date__gte=today,
        arrival_date__lte=today + timedelta(days=30)
    ).count()
    
    # Get overdue arrivals
    overdue_arrivals = VaccinationSubmission.objects.filter(
        arrival_date__lt=today,
        status__in=['submitted', 'processed']
    ).count()
    
    # Get tool usage statistics
    tool_usage_stats = ToolUsageEvent.objects.filter(
        timestamp__date__gte=last_30_days
    ).values('tool_name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Get poultry type popularity
    poultry_type_stats = VaccinationSubmission.objects.values('poultry_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Get geographic distribution
    country_stats = VaccinationSubmission.objects.exclude(
        country__isnull=True
    ).exclude(country='').values('country').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Get veterinarian assignments
    total_veterinarians = User.objects.filter(admin_role='veterinarian').count()
    assigned_submissions = VaccinationSubmission.objects.filter(
        assigned_veterinarian__isnull=False
    ).count()
    
    # Get recent activity
    recent_activity = VaccinationSubmission.objects.filter(
        created_at__date__gte=last_7_days
    ).order_by('-created_at')[:10]
    
    return Response({
        'total_submissions': total_submissions,
        'recent_submissions': recent_submissions,
        'upcoming_arrivals': upcoming_arrivals,
        'overdue_arrivals': overdue_arrivals,
        'tool_usage_stats': list(tool_usage_stats),
        'poultry_type_stats': list(poultry_type_stats),
        'country_stats': list(country_stats),
        'total_veterinarians': total_veterinarians,
        'assigned_submissions': assigned_submissions,
        'recent_activity': VaccinationSubmissionSerializer(recent_activity, many=True).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_veterinarian(request, submission_id):
    """Assign veterinarian to vaccination submission"""
    try:
        submission = VaccinationSubmission.objects.get(id=submission_id)
        veterinarian_id = request.data.get('veterinarian_id')
        
        if not veterinarian_id:
            return Response({
                'error': 'Veterinarian ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        veterinarian = User.objects.get(
            id=veterinarian_id,
            admin_role='veterinarian'
        )
        
        submission.assigned_veterinarian = veterinarian
        submission.assignment_date = timezone.now()
        submission.status = 'assigned_vet'
        submission.save()
        
        return Response({
            'success': True,
            'message': f'Veterinarian {veterinarian.full_name} assigned successfully'
        })
        
    except VaccinationSubmission.DoesNotExist:
        return Response({
            'error': 'Vaccination submission not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({
            'error': 'Veterinarian not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def veterinarian_dashboard(request, veterinarian_id):
    """Get dashboard data for specific veterinarian"""
    try:
        veterinarian = User.objects.get(
            id=veterinarian_id,
            admin_role='veterinarian'
        )
        
        # Get assigned submissions
        assigned_submissions = VaccinationSubmission.objects.filter(
            assigned_veterinarian=veterinarian
        ).order_by('arrival_date')
        
        # Get upcoming vaccinations
        upcoming_vaccinations = assigned_submissions.filter(
            arrival_date__gte=timezone.now().date(),
            status__in=['assigned_vet', 'processed']
        )
        
        # Get overdue vaccinations
        overdue_vaccinations = assigned_submissions.filter(
            arrival_date__lt=timezone.now().date(),
            status__in=['assigned_vet', 'processed']
        )
        
        return Response({
            'veterinarian': {
                'id': veterinarian.id,
                'name': veterinarian.full_name or veterinarian.username,
                'email': veterinarian.email,
                'phone': veterinarian.phone
            },
            'assigned_submissions': VaccinationSubmissionSerializer(
                assigned_submissions, many=True
            ).data,
            'upcoming_vaccinations': VaccinationSubmissionSerializer(
                upcoming_vaccinations, many=True
            ).data,
            'overdue_vaccinations': VaccinationSubmissionSerializer(
                overdue_vaccinations, many=True
            ).data,
            'total_assigned': assigned_submissions.count(),
            'upcoming_count': upcoming_vaccinations.count(),
            'overdue_count': overdue_vaccinations.count()
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'Veterinarian not found'
        }, status=status.HTTP_404_NOT_FOUND)

