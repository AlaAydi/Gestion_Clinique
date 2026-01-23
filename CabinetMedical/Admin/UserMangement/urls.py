from django.urls import path
from . import views
from .views import AdminReclamationsListView

urlpatterns = [
    # Patients (CBV)
    path('patients/', views.PatientListCreateView.as_view(), name='admin-patients-list'),
    path('patients/<int:pk>/', views.PatientDetailView.as_view(), name='admin-patient-detail'),

    path('reclamations/', AdminReclamationsListView.as_view()),

    # Doctors (CBV)
    path('doctors/', views.DoctorListCreateView.as_view(), name='admin-doctors-list'),
    path('doctors/<int:pk>/', views.DoctorDetailView.as_view(), name='admin-doctor-detail'),
]
