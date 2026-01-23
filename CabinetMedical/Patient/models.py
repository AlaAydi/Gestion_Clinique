from django.db import models

from users.models import Patient, Doctor


# Create your models here.


class Reclamation(models.Model):
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours'),
        ('RESOLU', 'Résolu'),
        ('FERME', 'Fermé'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reclamations')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reclamations_recues')
    sujet = models.CharField(max_length=255)
    message = models.TextField()
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='EN_ATTENTE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Réclamation"
        verbose_name_plural = "Réclamations"

    def __str__(self):
        return f"Réclamation #{self.id} - {self.patient.nom} -> Dr. {self.doctor.nom}"

