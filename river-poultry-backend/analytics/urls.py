from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Tool usage tracking
    path('tool-usage/', views.ToolUsageEventListCreateView.as_view(), name='tool-usage-list'),
    path('track-usage/', views.track_tool_usage, name='track-usage'),
    
    # Vaccination submissions
    path('vaccination-submissions/', views.VaccinationSubmissionListCreateView.as_view(), name='vaccination-submissions'),
    path('submit-vaccination/', views.submit_vaccination_schedule, name='submit-vaccination'),
    
    # Analytics data
    path('analytics/', views.FrontendAnalyticsListView.as_view(), name='analytics-list'),
    path('dashboard-metrics/', views.dashboard_metrics, name='dashboard-metrics'),
    
    # Veterinarian management
    path('assign-veterinarian/<str:submission_id>/', views.assign_veterinarian, name='assign-veterinarian'),
    path('veterinarian-dashboard/<int:veterinarian_id>/', views.veterinarian_dashboard, name='veterinarian-dashboard'),
]

