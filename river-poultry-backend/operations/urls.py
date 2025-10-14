from django.urls import path
from . import views

urlpatterns = [
    # Operations CRUD
    path('', views.PoultryOperationListCreateView.as_view(), name='operation-list-create'),
    path('<int:pk>/', views.PoultryOperationDetailView.as_view(), name='operation-detail'),
    path('<int:pk>/metrics/', views.OperationMetricsView.as_view(), name='operation-metrics'),
    
    # Operation management
    path('stats/', views.operation_stats, name='operation-stats'),
    path('upcoming/', views.upcoming_operations, name='upcoming-operations'),
    path('overdue/', views.overdue_operations, name='overdue-operations'),
    path('<int:operation_id>/update-age/', views.update_operation_age, name='update-operation-age'),
]




