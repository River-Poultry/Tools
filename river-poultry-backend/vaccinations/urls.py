from django.urls import path
from . import views

urlpatterns = [
    # Vaccination plans CRUD
    path('plans/', views.VaccinationPlanListCreateView.as_view(), name='vaccination-plan-list-create'),
    path('plans/<int:pk>/', views.VaccinationPlanDetailView.as_view(), name='vaccination-plan-detail'),
    path('plans/<int:vaccination_id>/complete/', views.complete_vaccination, name='complete-vaccination'),
    path('plans/<int:vaccination_id>/reschedule/', views.reschedule_vaccination, name='reschedule-vaccination'),
    
    # Vaccination templates
    path('templates/', views.VaccinationTemplateListView.as_view(), name='vaccination-template-list'),
    
    # Vaccination management
    path('generate-schedule/', views.generate_vaccination_schedule, name='generate-vaccination-schedule'),
    path('upcoming/', views.upcoming_vaccinations, name='upcoming-vaccinations'),
    path('overdue/', views.overdue_vaccinations, name='overdue-vaccinations'),
    path('stats/', views.vaccination_stats, name='vaccination-stats'),
    
    # Reminder management
    path('plans/<int:vaccination_id>/reminders/create/', views.create_reminder_schedule, name='create-reminder-schedule'),
    path('plans/<int:vaccination_id>/reminders/', views.get_reminder_schedule, name='get-reminder-schedule'),
    path('plans/<int:vaccination_id>/reminders/test/', views.send_test_reminder, name='send-test-reminder'),
    path('reminders/upcoming/', views.get_upcoming_reminders, name='get-upcoming-reminders'),
    path('reminders/stats/', views.get_reminder_stats, name='get-reminder-stats'),
    path('reminders/process-all/', views.process_all_reminders, name='process-all-reminders'),
]




