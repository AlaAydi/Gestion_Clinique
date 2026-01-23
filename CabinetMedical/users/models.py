from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import timedelta
from django.core.exceptions import ValidationError

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    )

    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_approved = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100, blank=True)
    prenom = models.CharField(max_length=100, blank=True)
    age = models.IntegerField(null=True, blank=True)
    address = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True)
    antecedents = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=(('Actif', 'Actif'), ('Inactif', 'Inactif')),
        default='Actif'
    )
    medical_file = models.FileField(upload_to='medical_files/', null=True, blank=True)

    def __str__(self):
        return f"{self.nom} {self.prenom}" if self.nom else self.user.username

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100, blank=True)
    prenom = models.CharField(max_length=100, blank=True)
    specialty = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    schedule = models.CharField(max_length=50)
    image = models.ImageField(upload_to='doctor_images/', null=True, blank=True)

    def __str__(self):
        return f"Dr. {self.nom} {self.prenom}" if self.nom else self.user.username


class Consultation(models.Model):
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='consultations'
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='consultations'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True)
    motif = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        # durée fixe 30 min
        self.end_time = self.start_time + timedelta(minutes=30)

        conflict = Consultation.objects.filter(
            doctor=self.doctor,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        )

        if self.pk:
            conflict = conflict.exclude(pk=self.pk)

        if conflict.exists():
            raise ValidationError("Ce docteur a déjà une consultation à cette heure")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.doctor.user.username} - {self.patient.user.username}"


class DossierMedical(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='dossiers'
    )
    observations = models.TextField(blank=True)
    traitement = models.TextField(blank=True)
    fichier = models.FileField(upload_to='dossiers_medicaux/', null=True, blank=True)
    date_derniere_visite = models.DateField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_derniere_visite']

    def __str__(self):
        return f"Dossier {self.patient} - {self.date_derniere_visite}"
