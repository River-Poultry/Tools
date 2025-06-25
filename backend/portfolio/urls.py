from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('msme/', views.msme_list, name='msme_list'),
    path('msme/<int:msme_id>/', views.msme_detail, name='msme_detail'),
    path('msme/upload/', views.upload_msme_data, name='upload_msme_data'),
    path('msme/analytics/', views.msme_analytics, name='msme_analytics'),
    path('msme/<int:msme_id>/edit/', views.msme_edit, name='msme_edit'),
    path('msme/<int:msme_id>/delete/', views.msme_delete, name='msme_delete'),
    path('bge/', views.bge_list, name='bge_list'),
    path('bge/upload/', views.upload_bge_data, name='upload_bge_data'),
    path('bge/export/', views.export_bge_excel, name='export_bge_excel'),
    path('bge/<int:bge_id>/', views.bge_detail, name='bge_detail'),
    path('bge/<int:bge_id>/edit/', views.bge_edit, name='bge_edit'),
    path('bge/<int:bge_id>/delete/', views.bge_delete, name='bge_delete'),
    path('msme/export/', views.export_msme_excel, name='export_msme_excel'),
    path('support-request/', views.support_request, name='support_request'),
    path('bge-leaderboard/', views.bge_leaderboard, name='bge_leaderboard'),
    path('bge-signup/', views.bge_signup, name='bge_signup'),
    path('bge-approval/', views.bge_approval_list, name='bge_approval_list'),
    path('bge-approve/<int:bge_id>/', views.bge_approve, name='bge_approve'),
    path('bge-reject/<int:bge_id>/', views.bge_reject, name='bge_reject'),
] 