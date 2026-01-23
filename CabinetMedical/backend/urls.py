# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/Admin/', include('Admin.UserMangement.urls')),
    path('api/Admin/consultations/', include('Admin.Consultation.urls')),
    path('api/Admin/medicalfile/', include('Admin.MedicalFile.urls')),

    path('api/Admin/calendar/', include('Admin.AdminCalender.urls')),

    path('api/doctor-patient/', include('DoctorPatient.urls')),
    path('api/patient/', include('Patient.urls')),
    path('api/doctor-calendar/', include('DoctorCalender.urls')),
    path('api/factures/', include('Facture.urls')),
]

# Pour servir les fichiers médias (dossiers médicaux)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
