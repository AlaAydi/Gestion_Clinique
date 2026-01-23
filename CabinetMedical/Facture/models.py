from django.db import models
from users.models import Patient, Doctor, Consultation


class Facture(models.Model):
    STATUS_CHOICES = (
        ('PAYEE', 'Payée'),
        ('EN_ATTENTE', 'En attente'),
        ('ANNULEE', 'Annulée'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('ESPECES', 'Espèces'),
        ('CARTE', 'Carte bancaire'),
        ('CHEQUE', 'Chèque'),
        ('VIREMENT', 'Virement'),
    )
    
    numero_facture = models.CharField(max_length=50, unique=True)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='factures'
    )
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='factures'
    )
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='EN_ATTENTE')
    methode_paiement = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_paiement = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Facture {self.numero_facture} - {self.patient.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.numero_facture:
            # Générer un numéro de facture automatique
            from datetime import datetime
            last_facture = Facture.objects.order_by('-id').first()
            if last_facture and last_facture.numero_facture:
                try:
                    last_num = int(last_facture.numero_facture.split('-')[-1])
                    new_num = last_num + 1
                except:
                    new_num = 1
            else:
                new_num = 1
            self.numero_facture = f"FACT-{datetime.now().year}-{new_num:05d}"
        super().save(*args, **kwargs)
