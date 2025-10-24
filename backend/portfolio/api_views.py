from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncMonth
from .models import Portfolio, Investment, Transaction, MSME, BusinessGrowthExpert, SupportRequest, TrainingSession, Attendance, TrainingTopic
from .serializers import (
    PortfolioSerializer, InvestmentSerializer, TransactionSerializer,
    MSMESerializer, BusinessGrowthExpertSerializer, SupportRequestSerializer,
    TrainingSessionSerializer, AttendanceSerializer, TrainingTopicSerializer
)

class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get portfolio analytics"""
        portfolios = Portfolio.objects.all()
        
        total_value = sum(p.total_value() for p in portfolios)
        total_cost = sum(p.total_cost() for p in portfolios)
        total_return = total_value - total_cost
        total_return_percentage = (total_return / total_cost * 100) if total_cost > 0 else 0
        
        # Investment type distribution
        investment_types = Investment.objects.values('investment_type').annotate(
            count=Count('id'),
            total_value=Sum('current_price')
        )
        
        return Response({
            'total_portfolios': portfolios.count(),
            'total_value': total_value,
            'total_cost': total_cost,
            'total_return': total_return,
            'total_return_percentage': total_return_percentage,
            'investment_types': investment_types,
        })

class InvestmentViewSet(viewsets.ModelViewSet):
    queryset = Investment.objects.all()
    serializer_class = InvestmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Investment.objects.all()
        portfolio_id = self.request.query_params.get('portfolio', None)
        if portfolio_id:
            queryset = queryset.filter(portfolio_id=portfolio_id)
        return queryset

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Transaction.objects.all()
        investment_id = self.request.query_params.get('investment', None)
        if investment_id:
            queryset = queryset.filter(investment_id=investment_id)
        return queryset.order_by('-transaction_date')

class MSMEViewSet(viewsets.ModelViewSet):
    queryset = MSME.objects.filter(is_active=True)
    serializer_class = MSMESerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MSME.objects.filter(is_active=True)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                business_name__icontains=search
            ) | queryset.filter(
                owner_name__icontains=search
            ) | queryset.filter(
                sector__icontains=search
            )
        
        # Filters
        business_type = self.request.query_params.get('business_type', None)
        if business_type:
            queryset = queryset.filter(business_type=business_type)
            
        sector = self.request.query_params.get('sector', None)
        if sector:
            queryset = queryset.filter(sector=sector)
            
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__iexact=city)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get MSME analytics"""
        msmes = MSME.objects.filter(is_active=True)
        
        total_msmes = msmes.count()
        total_investment_needed = sum(msme.investment_needed or 0 for msme in msmes)
        total_annual_revenue = sum(msme.annual_revenue or 0 for msme in msmes)
        total_employees = sum(msme.employee_count or 0 for msme in msmes)
        
        # Business type distribution
        business_type_stats = msmes.values('business_type').annotate(count=Count('id'))
        
        # Sector distribution
        sector_stats = msmes.values('sector').annotate(count=Count('id'))
        
        # Top cities
        top_cities = msmes.values('city').exclude(city='').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'total_msmes': total_msmes,
            'total_investment_needed': total_investment_needed,
            'total_annual_revenue': total_annual_revenue,
            'total_employees': total_employees,
            'business_type_stats': business_type_stats,
            'sector_stats': sector_stats,
            'top_cities': top_cities,
        })

class BusinessGrowthExpertViewSet(viewsets.ModelViewSet):
    queryset = BusinessGrowthExpert.objects.all()
    serializer_class = BusinessGrowthExpertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = BusinessGrowthExpert.objects.all()
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get BGE leaderboard"""
        bges = BusinessGrowthExpert.objects.filter(status='approved')
        
        # Add support request count
        for bge in bges:
            bge.support_count = bge.support_requests.count()
        
        # Sort by support count
        bges = sorted(bges, key=lambda x: x.support_count, reverse=True)
        
        serializer = self.get_serializer(bges, many=True)
        return Response(serializer.data)

class SupportRequestViewSet(viewsets.ModelViewSet):
    queryset = SupportRequest.objects.all()
    serializer_class = SupportRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create support request and match with BGEs"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        support_request = serializer.save()
        
        # Match with nearby BGEs (simple matching for now)
        nearby_bges = BusinessGrowthExpert.objects.filter(
            status='approved',
            location__icontains=support_request.location
        )[:3]
        
        support_request.matched_bges.set(nearby_bges)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        """Mark attendance for a training session"""
        session = self.get_object()
        msme_id = request.data.get('msme_id')
        present = request.data.get('present', True)
        
        attendance, created = Attendance.objects.get_or_create(
            session=session,
            msme_id=msme_id,
            defaults={'present': present}
        )
        
        if not created:
            attendance.present = present
            attendance.save()
        
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Attendance.objects.all()
        session_id = self.request.query_params.get('session', None)
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset

class TrainingTopicViewSet(viewsets.ModelViewSet):
    queryset = TrainingTopic.objects.all()
    serializer_class = TrainingTopicSerializer
    permission_classes = [IsAuthenticated] 