from django.urls import path
from .views import DoctorCalendarView

urlpatterns = [
    path('consultations/', DoctorCalendarView.as_view(), name='doctor-calendar'),
]
