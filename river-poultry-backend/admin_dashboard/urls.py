from django.urls import path
from . import views

app_name = 'admin_dashboard'

urlpatterns = [
    # Main dashboard
    path('', views.user_activity_dashboard, name='user_activity_dashboard'),
    
    # Detailed views
    path('vaccination-activity/', views.vaccination_activity, name='vaccination_activity'),
    path('geographic-analytics/', views.geographic_analytics, name='geographic_analytics'),
    path('real-time-monitor/', views.real_time_monitor, name='real_time_monitor'),
    path('tool-usage/<str:tool_name>/', views.tool_usage_details, name='tool_usage_details'),
    
    # API endpoints
    path('api/user-analytics/', views.user_analytics_api, name='user_analytics_api'),
]


