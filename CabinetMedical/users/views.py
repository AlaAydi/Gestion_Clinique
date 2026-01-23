from django.core.exceptions import ValidationError
from django.http import Http404
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegisterSerializer
from .models import User, Patient, Doctor
from .permissions import IsAdminRole, IsDoctorRole, IsAdminOrDoctor
from rest_framework.parsers import MultiPartParser, FormParser
from .utils import send_admin_notification, send_approval_email
from .serializers import (
    AdminProfileSerializer,
    DoctorProfileSerializer,
    PatientProfileSerializer,
    ChangePasswordSerializer
)
class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # notifier l'admin pour approbation
            try:
                send_admin_notification(user)
            except Exception as e:
                print(f"Erreur envoi email admin: {e}")
            return Response({'message': 'Utilisateur créé avec succès. En attente d\u2019approbation.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Email incorrect"}, status=401)

        user = authenticate(request, username=user_obj.email, password=password)
        if not user:
            return Response({"error": "Mot de passe incorrect"}, status=401)
        if not user.is_approved:
            return Response({"error": "Compte non approuvé"}, status=403)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "email": user.email
        })

class ApproveUserView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            if user.is_approved:
                return Response({"message": "Compte déjà approuvé"})
            user.is_approved = True
            user.save()
            # notifier l'utilisateur
            try:
                send_approval_email(user)
            except Exception as e:
                print(f"Erreur envoi email approbation: {e}")
            return Response({"message": "Compte approuvé avec succès"})
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)



class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Déconnexion réussie"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {"error": "Token invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )






class AdminProfileView(APIView):
    """
    Vue pour récupérer et modifier le profil admin
    GET: Récupère le profil
    PATCH: Met à jour le profil
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        user = request.user
        serializer = AdminProfileSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = AdminProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profil mis à jour avec succès",
                "data": serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorProfileView(APIView):
    """
    Vue pour récupérer et modifier le profil doctor
    GET: Récupère le profil
    PATCH: Met à jour le profil
    """
    permission_classes = [IsAuthenticated, IsDoctorRole]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
            serializer = DoctorProfileSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({"error": "Profil docteur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
            serializer = DoctorProfileSerializer(doctor, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Profil mis à jour avec succès",
                    "data": serializer.data
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Doctor.DoesNotExist:
            return Response({"error": "Profil docteur non trouvé"}, status=status.HTTP_404_NOT_FOUND)


class PatientProfileView(APIView):
    """
    Vue pour récupérer et modifier le profil patient
    GET: Récupère le profil
    PATCH: Met à jour le profil
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'PATIENT':
            return Response({"error": "Accès non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        try:
            patient = Patient.objects.get(user=request.user)
            serializer = PatientProfileSerializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response({"error": "Profil patient non trouvé"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        if request.user.role != 'PATIENT':
            return Response({"error": "Accès non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        try:
            patient = Patient.objects.get(user=request.user)
            serializer = PatientProfileSerializer(patient, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Profil mis à jour avec succès",
                    "data": serializer.data
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Patient.DoesNotExist:
            return Response({"error": "Profil patient non trouvé"}, status=status.HTTP_404_NOT_FOUND)


class ChangePasswordView(APIView):
    """
    Vue pour changer le mot de passe - tous les rôles
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            # Vérifier l'ancien mot de passe
            if not user.check_password(serializer.validated_data['current_password']):
                return Response(
                    {"error": "Mot de passe actuel incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Changer le mot de passe
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Mot de passe modifié avec succès"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)