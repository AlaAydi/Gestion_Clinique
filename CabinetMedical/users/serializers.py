from rest_framework import serializers
from .models import User, Patient, Doctor, Consultation, DossierMedical


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            is_approved=False
        )
        # Create related profile depending on role so list APIs can find profiles
        role = validated_data.get('role')
        if role == 'DOCTOR':
            try:
                Doctor.objects.create(user=user, specialty='', phone='', schedule='')
            except Exception:
                pass
        elif role == 'PATIENT':
            try:
                Patient.objects.create(user=user, address='', status='Actif')
            except Exception:
                pass

        return user



class ConsultationSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)
    patient_name = serializers.CharField(source='patient.user.username', read_only=True)

    class Meta:
        model = Consultation
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'patient',
            'patient_name',
            'start_time',
            'end_time',
            'motif'
        ]
        read_only_fields = ['end_time']


class AdminProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil admin"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'email']


class DoctorProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil doctor"""
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'email', 'username', 'nom', 'prenom', 'specialty', 'phone', 'schedule', 'image']
        read_only_fields = ['id', 'email', 'username']


class PatientProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil patient"""
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'email', 'username', 'nom', 'prenom', 'age', 'address', 'telephone', 'antecedents', 'status']
        read_only_fields = ['id', 'email', 'username', 'status']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour le changement de mot de passe"""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        return data