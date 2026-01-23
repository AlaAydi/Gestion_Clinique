from django.contrib import admin
from .models import Facture


@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display = ['numero_facture', 'patient', 'montant', 'statut', 'date_creation', 'date_paiement']
    list_filter = ['statut', 'methode_paiement', 'date_creation']
    search_fields = ['numero_facture', 'patient__user__username', 'patient__user__email']
    readonly_fields = ['numero_facture', 'date_creation']
