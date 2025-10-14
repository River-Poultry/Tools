from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.login_view, name='user-login'),
    path('logout/', views.logout_view, name='user-logout'),
    
    # Password reset
    path('password-reset/', views.password_reset_request, name='password-reset-request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    
    # User management
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/details/', views.UserProfileDetailView.as_view(), name='user-profile-details'),
    path('dashboard/', views.user_dashboard, name='user-dashboard'),
    
    # User-specific data endpoints
    path('my-tool-usage/', views.my_tool_usage, name='my-tool-usage'),
    path('my-vaccinations/', views.my_vaccinations, name='my-vaccinations'),
    path('my-operations/', views.my_operations, name='my-operations'),
    path('my-analytics/', views.my_analytics, name='my-analytics'),
]




