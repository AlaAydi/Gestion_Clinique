from django.urls import path
from .views import *
from .dashboard_views import (
    AdminDashboardStatsView,
    DoctorDashboardStatsView,
    PatientDashboardStatsView
)


from .rapport_views import (
    RapportCliniqueView,
    RapportCliniquePDFView,
    StatistiquesConsultationsView,
    RechercheAvanceeView
)

urlpatterns = [
    # Authentication
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('approve/<int:user_id>/', ApproveUserView.as_view(), name='approve-user'),

    path('logout/', LogoutView.as_view(), name='logout'),

    # Dashboard Statistics
    path('dashboard/admin/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('dashboard/doctor/stats/', DoctorDashboardStatsView.as_view(), name='doctor-dashboard-stats'),
    path('dashboard/patient/stats/', PatientDashboardStatsView.as_view(), name='patient-dashboard-stats'),

    path('profile/admin/', AdminProfileView.as_view(), name='admin-profile'),
    path('profile/doctor/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('profile/patient/', PatientProfileView.as_view(), name='patient-profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    # Rapports et Statistiques
    path('rapports/clinique/', RapportCliniqueView.as_view(), name='rapport-clinique'),
    path('rapports/clinique/pdf/', RapportCliniquePDFView.as_view(), name='rapport-clinique-pdf'),
    path('rapports/consultations/', StatistiquesConsultationsView.as_view(), name='stats-consultations'),
    path('recherche/', RechercheAvanceeView.as_view(), name='recherche-avancee'),
]
