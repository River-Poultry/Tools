from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Count
from .models import UserProfile
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful'
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'})
    except:
        return Response({'error': 'Token not found'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile management"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    """User profile details management"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """User dashboard with statistics"""
    user = request.user
    
    # Get user's operations count
    from operations.models import PoultryOperation
    operations_count = PoultryOperation.objects.filter(user=user).count()
    active_operations = PoultryOperation.objects.filter(user=user, status='active').count()
    
    # Get vaccination plans count
    from vaccinations.models import VaccinationPlan
    vaccination_plans = VaccinationPlan.objects.filter(operation__user=user).count()
    upcoming_vaccinations = VaccinationPlan.objects.filter(
        operation__user=user, 
        status='scheduled'
    ).count()
    
    return Response({
        'user': UserSerializer(user).data,
        'stats': {
            'total_operations': operations_count,
            'active_operations': active_operations,
            'total_vaccinations': vaccination_plans,
            'upcoming_vaccinations': upcoming_vaccinations
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_tool_usage(request):
    """Get user's tool usage history"""
    user = request.user
    
    # Get user's tool usage events
    from analytics.models import ToolUsageEvent
    from analytics.serializers import ToolUsageEventSerializer
    
    events = ToolUsageEvent.objects.filter(user=user).order_by('-timestamp')
    
    # Apply filters if provided
    tool_name = request.query_params.get('tool_name')
    if tool_name:
        events = events.filter(tool_name=tool_name)
    
    start_date = request.query_params.get('start_date')
    if start_date:
        events = events.filter(timestamp__date__gte=start_date)
    
    end_date = request.query_params.get('end_date')
    if end_date:
        events = events.filter(timestamp__date__lte=end_date)
    
    # Get statistics
    total_events = events.count()
    tool_stats = events.values('tool_name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'events': ToolUsageEventSerializer(events, many=True).data,
        'stats': {
            'total_events': total_events,
            'tool_breakdown': list(tool_stats)
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_vaccinations(request):
    """Get user's vaccination submissions and plans"""
    user = request.user
    
    # Get user's vaccination submissions
    from analytics.models import VaccinationSubmission
    from analytics.serializers import VaccinationSubmissionSerializer
    
    submissions = VaccinationSubmission.objects.filter(user=user).order_by('-created_at')
    
    # Get user's vaccination plans
    from vaccinations.models import VaccinationPlan
    from vaccinations.serializers import VaccinationPlanSerializer
    
    vaccination_plans = VaccinationPlan.objects.filter(operation__user=user).order_by('-created_at')
    
    # Get statistics
    total_submissions = submissions.count()
    total_plans = vaccination_plans.count()
    upcoming_plans = vaccination_plans.filter(status='scheduled').count()
    completed_plans = vaccination_plans.filter(status='completed').count()
    
    return Response({
        'submissions': VaccinationSubmissionSerializer(submissions, many=True).data,
        'vaccination_plans': VaccinationPlanSerializer(vaccination_plans, many=True).data,
        'stats': {
            'total_submissions': total_submissions,
            'total_plans': total_plans,
            'upcoming_plans': upcoming_plans,
            'completed_plans': completed_plans
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_operations(request):
    """Get user's poultry operations"""
    user = request.user
    
    from operations.models import PoultryOperation, OperationMetrics
    from operations.serializers import PoultryOperationSerializer, OperationMetricsSerializer
    
    operations = PoultryOperation.objects.filter(user=user).order_by('-created_at')
    
    # Get statistics
    total_operations = operations.count()
    active_operations = operations.filter(status='active').count()
    completed_operations = operations.filter(status='completed').count()
    
    # Get operation metrics
    operation_metrics = []
    for operation in operations:
        try:
            metrics = operation.metrics
            operation_metrics.append({
                'operation_id': operation.id,
                'operation_name': operation.operation_name,
                'metrics': OperationMetricsSerializer(metrics).data
            })
        except OperationMetrics.DoesNotExist:
            operation_metrics.append({
                'operation_id': operation.id,
                'operation_name': operation.operation_name,
                'metrics': None
            })
    
    return Response({
        'operations': PoultryOperationSerializer(operations, many=True).data,
        'operation_metrics': operation_metrics,
        'stats': {
            'total_operations': total_operations,
            'active_operations': active_operations,
            'completed_operations': completed_operations
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_analytics(request):
    """Get user's analytics data"""
    user = request.user
    
    # Get user's tool usage statistics
    from analytics.models import ToolUsageEvent
    from django.db.models import Count
    from django.utils import timezone
    from datetime import timedelta
    
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    last_7_days = today - timedelta(days=7)
    
    # Tool usage stats
    total_tool_usage = ToolUsageEvent.objects.filter(user=user).count()
    recent_tool_usage = ToolUsageEvent.objects.filter(
        user=user, 
        timestamp__date__gte=last_7_days
    ).count()
    
    # Tool breakdown
    tool_breakdown = ToolUsageEvent.objects.filter(user=user).values('tool_name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Monthly usage
    monthly_usage = ToolUsageEvent.objects.filter(
        user=user,
        timestamp__date__gte=last_30_days
    ).extra(
        select={'month': "DATE_TRUNC('month', timestamp)"}
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')
    
    # Device usage
    device_usage = ToolUsageEvent.objects.filter(user=user).values('device_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'tool_usage_stats': {
            'total_usage': total_tool_usage,
            'recent_usage': recent_tool_usage,
            'tool_breakdown': list(tool_breakdown),
            'monthly_usage': list(monthly_usage),
            'device_usage': list(device_usage)
        }
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    """Request password reset"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists or not
            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Send email
        subject = 'Password Reset Request - River Poultry Tools'
        message = f"""
        Hello {user.first_name},
        
        You requested a password reset for your River Poultry Tools account.
        
        Please click the link below to reset your password:
        {reset_url}
        
        If you didn't request this password reset, please ignore this email.
        
        This link will expire in 24 hours.
        
        Best regards,
        River Poultry Tools Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to send password reset email. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    """Confirm password reset"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if token is valid
        if not default_token_generator.check_token(user, token):
            return Response({
                'error': 'Invalid or expired reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Delete all existing tokens for security
        Token.objects.filter(user=user).delete()
        
        return Response({
            'message': 'Password has been reset successfully. Please log in with your new password.'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
