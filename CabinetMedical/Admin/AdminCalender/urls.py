from django.urls import path
from .views import AdminCalendarView, AdminCalendarConsultationView

urlpatterns = [
    path('', AdminCalendarView.as_view(), name='admin-calendar'),
    path('consultations/', AdminCalendarConsultationView.as_view(), name='admin-calendar-consultations'),
]
