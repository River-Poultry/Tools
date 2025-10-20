from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import PushSubscription, NotificationMessage, NotificationDelivery
from .serializers import PushSubscriptionSerializer, NotificationMessageSerializer
import base64
import json
import logging

logger = logging.getLogger(__name__)

# Push Subscription Views
class PushSubscriptionView(ListCreateAPIView):
    serializer_class = PushSubscriptionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return PushSubscription.objects.all()

@api_view(['POST'])
@permission_classes([AllowAny])
def unsubscribe_from_notifications(request):
    """Unsubscribe from push notifications"""
    try:
        endpoint = request.data.get('endpoint')
        if endpoint:
            PushSubscription.objects.filter(endpoint=endpoint).delete()
            return Response({'success': True, 'message': 'Unsubscribed successfully'})
        return Response({'success': False, 'message': 'Endpoint required'}, status=400)
    except Exception as e:
        logger.error(f"Unsubscribe error: {str(e)}")
        return Response({'success': False, 'message': 'Unsubscribe failed'}, status=500)

# Notification Message Management
class NotificationMessageListCreateView(ListCreateAPIView):
    serializer_class = NotificationMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationMessage.objects.all()

class NotificationMessageDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationMessage.objects.all()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification(request, notification_id):
    """Send a notification to all subscribers"""
    try:
        notification = NotificationMessage.objects.get(id=notification_id)
        # Implementation for sending push notifications
        return Response({'success': True, 'message': 'Notification sent'})
    except NotificationMessage.DoesNotExist:
        return Response({'success': False, 'message': 'Notification not found'}, status=404)
    except Exception as e:
        logger.error(f"Send notification error: {str(e)}")
        return Response({'success': False, 'message': 'Failed to send notification'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_deliveries(request, notification_id):
    """Get delivery statistics for a notification"""
    try:
        deliveries = NotificationDelivery.objects.filter(notification_id=notification_id)
        data = {
            'total_sent': deliveries.count(),
            'successful': deliveries.filter(status='delivered').count(),
            'failed': deliveries.filter(status='failed').count()
        }
        return Response(data)
    except Exception as e:
        logger.error(f"Delivery stats error: {str(e)}")
        return Response({'success': False, 'message': 'Failed to get delivery stats'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """Get overall notification statistics"""
    try:
        data = {
            'total_subscribers': PushSubscription.objects.count(),
            'total_notifications': NotificationMessage.objects.count(),
            'total_deliveries': NotificationDelivery.objects.count()
        }
        return Response(data)
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        return Response({'success': False, 'message': 'Failed to get stats'}, status=500)

# Email Report Functionality
def generate_email_html(context):
    """Generate HTML email template"""
    report_type = context['report_type']
    report_title = context['report_title']
    farmer_name = context['farmer_name']
    report_data = context['report_data']
    company_name = context['company_name']
    company_website = context['company_website']
    company_color = context['company_color']
    company_bg_color = context['company_bg_color']

    # Generate report-specific content
    content = ""
    if report_type == 'welcome':
        content = f"""
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: {company_color}; margin-top: 0;">Welcome to River Poultry & SmartVet!</h4>
            <p>Thank you for joining our community! We're excited to help you with your poultry farming needs.</p>
            <h5 style="color: {company_color};">What you can do with our tools:</h5>
            <ul>
                <li><strong>Budget Calculator:</strong> Plan your poultry farming budget with detailed cost analysis</li>
                <li><strong>Vaccination Scheduler:</strong> Get personalized vaccination schedules for your birds</li>
                <li><strong>House Design:</strong> Calculate optimal house dimensions and ventilation requirements</li>
                <li><strong>Nutrition Planning:</strong> Plan feeding schedules and nutritional requirements</li>
            </ul>
            <p>You'll receive email notifications about your generated reports, important reminders, updates, and seasonal farming tips.</p>
        </div>
        """
    elif report_type == 'budget':
        content = f"""
        <p>Dear {farmer_name},</p>
        <p>Thank you for using our Poultry Budget Calculator! Please find attached your detailed budget report.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: {company_color}; margin-top: 0;">Report Summary:</h4>
            <ul>
                <li><strong>Bird Type:</strong> {report_data.get('birdType', 'N/A')}</li>
                <li><strong>Number of Birds:</strong> {report_data.get('numBirds', 0)}</li>
                <li><strong>Production Period:</strong> {report_data.get('productionPeriod', 'N/A')}</li>
                <li><strong>Total Costs:</strong> {report_data.get('totalCosts', 'N/A')}</li>
                <li><strong>Net Profit:</strong> {report_data.get('netProfit', 'N/A')}</li>
            </ul>
        </div>
        """
    elif report_type == 'vaccination':
        content = f"""
        <p>Dear {farmer_name},</p>
        <p>Thank you for using our Vaccination Scheduler! Please find attached your detailed vaccination schedule.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: {company_color}; margin-top: 0;">Schedule Summary:</h4>
            <ul>
                <li><strong>Bird Type:</strong> {report_data.get('type', 'N/A')}</li>
                <li><strong>Arrival Date:</strong> {report_data.get('arrivalDate', 'N/A')}</li>
                <li><strong>Sale Date:</strong> {report_data.get('saleDate', 'N/A')}</li>
                <li><strong>Total Vaccinations:</strong> {report_data.get('totalVaccinations', 0)}</li>
            </ul>
        </div>
        """
    elif report_type == 'house-design':
        content = f"""
        <p>Dear {farmer_name},</p>
        <p>Thank you for using our House Design Calculator! Please find attached your detailed house design report.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: {company_color}; margin-top: 0;">Design Summary:</h4>
            <ul>
                <li><strong>Bird Type:</strong> {report_data.get('type', 'N/A')}</li>
                <li><strong>Number of Birds:</strong> {report_data.get('birds', 0)}</li>
                <li><strong>Required Space:</strong> {report_data.get('requiredSpace', 'N/A')} sq ft</li>
                <li><strong>Ventilation Area:</strong> {report_data.get('ventilationArea', 'N/A')} sq ft</li>
            </ul>
        </div>
        """
    elif report_type == 'nutrition':
        content = f"""
        <p>Dear {farmer_name},</p>
        <p>Thank you for using our Nutrition Planner! Please find attached your detailed nutrition report.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: {company_color}; margin-top: 0;">Nutrition Summary:</h4>
            <ul>
                <li><strong>Bird Type:</strong> {report_data.get('type', 'N/A')}</li>
                <li><strong>Number of Birds:</strong> {report_data.get('birds', 0)}</li>
                <li><strong>Production Period:</strong> {report_data.get('period', 'N/A')}</li>
            </ul>
        </div>
        """

    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: {company_bg_color}; padding: 20px; text-align: center;">
            <h2 style="color: {company_color}; margin: 0;">{company_name}</h2>
        </div>
        <div style="padding: 20px;">
            <h3 style="color: {company_color};">{report_title}</h3>
            {content}
            <p>If you have any questions about your report or need assistance, please don't hesitate to contact us.</p>
            <p>Best regards,<br>
            <strong>{company_name} Team</strong></p>
        </div>
        <div style="background-color: {company_bg_color}; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Powered by {company_name} | {company_website}</p>
        </div>
    </div>
    """

@api_view(['POST'])
@permission_classes([AllowAny])
def send_report_email(request):
    """Send report email using Django's email backend (Zoho Mail)"""
    try:
        to_email = request.data.get('to_email')
        report_type = request.data.get('report_type')
        report_data = request.data.get('report_data', {})
        pdf_content = request.data.get('pdf_content')
        pdf_filename = request.data.get('pdf_filename')
        farmer_name = request.data.get('farmer_name', 'Customer')
        farmer_phone = request.data.get('farmer_phone', '')

        if not to_email:
            return Response(
                {'success': False, 'message': 'Email address is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate email subject based on report type
        report_titles = {
            'budget': 'Poultry Budget Report',
            'vaccination': 'Poultry Vaccination Schedule',
            'house-design': 'Poultry House Design Report',
            'nutrition': 'Poultry Nutrition Report',
            'welcome': 'Welcome to River Poultry & SmartVet!'
        }

        subject = f"{report_titles.get(report_type, 'Poultry Report')} - River Poultry & SmartVet"

        # Prepare email context
        context = {
            'report_type': report_type,
            'report_title': report_titles.get(report_type, 'Poultry Report'),
            'farmer_name': farmer_name,
            'farmer_email': to_email,
            'farmer_phone': farmer_phone,
            'report_data': report_data,
            'company_name': 'River Poultry & SmartVet',
            'company_website': 'www.riverpoultry.com',
            'company_color': '#286844',
            'company_bg_color': '#f1f2b0'
        }

        # Create email object
        email = EmailMultiAlternatives(
            subject,
            strip_tags(generate_email_html(context)),
            settings.DEFAULT_FROM_EMAIL,
            [to_email]
        )

        # Generate HTML content and attach
        html_content = generate_email_html(context)
        email.attach_alternative(html_content, "text/html")

        # Attach PDF if provided (skip for welcome emails)
        if pdf_content and report_type != 'welcome':
            try:
                pdf_data = base64.b64decode(pdf_content)
                email.attach(pdf_filename, pdf_data, 'application/pdf')
            except Exception as e:
                logger.error(f"Error attaching PDF: {str(e)}")

        # Send email
        email.send()
        logger.info(f"Report email sent successfully to {to_email}")
        return Response({'success': True, 'message': 'Email sent successfully'})

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return Response(
            {'success': False, 'message': f'Failed to send email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )