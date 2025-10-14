from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Avg, Count
from django.utils import timezone
from .models import PoultryOperation, OperationMetrics
from .serializers import (
    PoultryOperationSerializer, OperationCreateSerializer, 
    OperationUpdateSerializer, OperationMetricsSerializer,
    OperationStatsSerializer
)


class PoultryOperationListCreateView(generics.ListCreateAPIView):
    """List and create poultry operations"""
    serializer_class = PoultryOperationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['poultry_type', 'status', 'breed']
    search_fields = ['operation_name', 'batch_name', 'breed', 'source']
    ordering_fields = ['created_at', 'arrival_date', 'expected_sale_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return PoultryOperation.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OperationCreateSerializer
        return PoultryOperationSerializer


class PoultryOperationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific operation"""
    serializer_class = PoultryOperationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PoultryOperation.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return OperationUpdateSerializer
        return PoultryOperationSerializer


class OperationMetricsView(generics.RetrieveUpdateAPIView):
    """Manage operation metrics"""
    serializer_class = OperationMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return OperationMetrics.objects.filter(operation__user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def operation_stats(request):
    """Get operation statistics for the user"""
    user = request.user
    
    # Get basic counts
    total_operations = PoultryOperation.objects.filter(user=user).count()
    active_operations = PoultryOperation.objects.filter(user=user, status='active').count()
    completed_operations = PoultryOperation.objects.filter(user=user, status='completed').count()
    
    # Get total birds
    total_birds = PoultryOperation.objects.filter(user=user).aggregate(
        total=Sum('number_of_birds')
    )['total'] or 0
    
    # Get financial metrics
    metrics = OperationMetrics.objects.filter(operation__user=user)
    total_revenue = metrics.aggregate(total=Sum('total_revenue'))['total'] or 0
    total_costs = metrics.aggregate(total=Sum('total_costs'))['total'] or 0
    net_profit = total_revenue - total_costs
    
    # Get average mortality rate
    avg_mortality = metrics.aggregate(avg=Avg('mortality_rate'))['avg'] or 0
    
    stats = {
        'total_operations': total_operations,
        'active_operations': active_operations,
        'completed_operations': completed_operations,
        'total_birds': total_birds,
        'average_mortality_rate': round(avg_mortality, 2),
        'total_revenue': float(total_revenue),
        'total_costs': float(total_costs),
        'net_profit': float(net_profit)
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_operations(request):
    """Get operations that are due for sale soon"""
    user = request.user
    today = timezone.now().date()
    
    # Get operations due in next 30 days
    upcoming = PoultryOperation.objects.filter(
        user=user,
        status='active',
        expected_sale_date__gte=today,
        expected_sale_date__lte=today + timezone.timedelta(days=30)
    ).order_by('expected_sale_date')
    
    serializer = PoultryOperationSerializer(upcoming, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def overdue_operations(request):
    """Get operations that are overdue for sale"""
    user = request.user
    today = timezone.now().date()
    
    overdue = PoultryOperation.objects.filter(
        user=user,
        status='active',
        expected_sale_date__lt=today
    ).order_by('expected_sale_date')
    
    serializer = PoultryOperationSerializer(overdue, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_operation_age(request, operation_id):
    """Update the current age of an operation"""
    try:
        operation = PoultryOperation.objects.get(id=operation_id, user=request.user)
        new_age = request.data.get('current_age_days')
        
        if new_age is not None:
            operation.current_age_days = new_age
            operation.save()
            
            return Response({
                'message': 'Operation age updated successfully',
                'current_age_days': operation.current_age_days,
                'current_age_weeks': operation.current_age_weeks
            })
        else:
            return Response({
                'error': 'current_age_days is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except PoultryOperation.DoesNotExist:
        return Response({
            'error': 'Operation not found'
        }, status=status.HTTP_404_NOT_FOUND)
