from django.urls import path
from .views import (
    FactureListCreateView,
    FactureDetailView,
    FacturePaymentView,
    PatientFacturesListView,
    PatientFactureDetailView,
    FactureStatsView
)

urlpatterns = [
    # Admin routes
    path('', FactureListCreateView.as_view(), name='facture-list-create'),
    path('<int:pk>/', FactureDetailView.as_view(), name='facture-detail'),
    path('<int:pk>/payer/', FacturePaymentView.as_view(), name='facture-payment'),
    path('stats/', FactureStatsView.as_view(), name='facture-stats'),
    
    # Patient routes
    path('patient/mes-factures/', PatientFacturesListView.as_view(), name='patient-factures'),
    path('patient/mes-factures/<int:pk>/', PatientFactureDetailView.as_view(), name='patient-facture-detail'),
]
