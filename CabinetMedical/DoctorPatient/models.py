from django.db import models
from users.models import Doctor, Patient


class Reclamation(models.Model):
    STATUT_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours'),
        ('RESOLU', 'Résolu'),
        ('FERME', 'Fermé'),
    )
    
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reclamations_envoyees')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reclamations_recues')
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Réclamation: {self.sujet} - {self.patient}"


class Message(models.Model):
    expediteur_doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        related_name='messages_envoyes',
        null=True,
        blank=True
    )
    expediteur_patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='messages_envoyes',
        null=True,
        blank=True
    )
    destinataire_doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='messages_recus',
        null=True,
        blank=True
    )
    destinataire_patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='messages_recus',
        null=True,
        blank=True
    )
    contenu = models.TextField()
    lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        exp = self.expediteur_doctor or self.expediteur_patient
        dest = self.destinataire_doctor or self.destinataire_patient
        return f"Message de {exp} à {dest}"
