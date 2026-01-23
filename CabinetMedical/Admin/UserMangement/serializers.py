from DoctorPatient.models import Reclamation
from users.models import (
    Patient,
    User
)
from users.models import Doctor
from rest_framework import serializers



class PatientSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'username', 'email', 'nom', 'prenom', 'age', 'address', 'telephone', 'antecedents', 'status', 'medical_file']

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if 'status' in validated_data:
            instance.user.is_approved = validated_data['status'] == 'Actif'
            instance.user.save()

        instance.save()
        return instance

class PatientCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Patient
        fields = ['username', 'email', 'password', 'nom', 'prenom', 'age', 'address', 'telephone', 'antecedents', 'status', 'medical_file']

    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='PATIENT',
            is_approved=True
        )
        patient = Patient.objects.create(
            user=user,
            **validated_data
        )
        return patient

class AdminPatientListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='username')

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'is_approved']

class PatientMedicalFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'user', 'medical_file']
        read_only_fields = ['id', 'user']

class DoctorCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id',
            'username',
            'email',
            'password',
            'nom',
            'prenom',
            'specialty',
            'phone',
            'schedule',
            'image'
        ]

    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='DOCTOR',
            is_approved=True
        )

        doctor = Doctor.objects.create(
            user=user,
            **validated_data
        )

        return doctor
    
class AdminDoctorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    nom = serializers.CharField(required=False, allow_blank=True)
    prenom = serializers.CharField(required=False, allow_blank=True)
    specialty = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    schedule = serializers.CharField(required=False)
    image = serializers.ImageField(required=False, allow_null=True)
    
    # Champs pour modifier email et mot de passe
    new_email = serializers.EmailField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = Doctor
        fields = ['id', 'username', 'email', 'nom', 'prenom', 'specialty', 'phone', 'schedule', 'image', 'new_email', 'new_password']
    
    def update(self, instance, validated_data):
        # Extraire les champs liés à l'utilisateur
        new_email = validated_data.pop('new_email', None)
        new_password = validated_data.pop('new_password', None)
        
        # Mise à jour des champs du docteur
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mise à jour de l'email si fourni
        if new_email:
            instance.user.email = new_email
        
        # Mise à jour du mot de passe si fourni
        if new_password:
            instance.user.set_password(new_password)
        
        # Sauvegarder les changements de l'utilisateur
        if new_email or new_password:
            instance.user.save()
        
        return instance


class AdminReclamationSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)

    class Meta:
        model = Reclamation
        fields = [
            'id',
            'patient_name',
            'doctor_name',
            'sujet',
            'message',
            'statut',
            'created_at'
        ]