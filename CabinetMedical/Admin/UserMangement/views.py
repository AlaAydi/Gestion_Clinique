from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView

from DoctorPatient.models import Reclamation
from users.models import Patient, Doctor, User
from users.permissions import IsAdminRole
from .serializers import (
	PatientSerializer as AdminPatientSerializer,
	PatientCreateSerializer as AdminPatientCreateSerializer,
	AdminDoctorSerializer,
	DoctorCreateSerializer as AdminDoctorCreateSerializer, AdminReclamationSerializer

)



class PatientListCreateView(generics.ListCreateAPIView):
	permission_classes = [IsAuthenticated, IsAdminRole]

	def get_queryset(self):
		q = self.request.query_params.get('q')
		status = self.request.query_params.get('status')
		# base queryset
		qs = Patient.objects.select_related('user').all()
		if status:
			qs = qs.filter(status__iexact=status)
		if q:
			if q.isdigit():
				qs = qs.filter(user__id=int(q))
			else:
				qs = qs.filter(
					Q(user__username__icontains=q) |
					Q(user__email__icontains=q) |
					Q(address__icontains=q)
				)
		return qs

	def get_serializer_class(self):
		if self.request.method == 'POST':
			return AdminPatientCreateSerializer
		return AdminPatientSerializer


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Patient.objects.all()
	permission_classes = [IsAuthenticated, IsAdminRole]
	serializer_class = AdminPatientSerializer








class DoctorListCreateView(generics.ListCreateAPIView):
	permission_classes = [IsAuthenticated, IsAdminRole]

	def get_queryset(self):
		q = self.request.query_params.get('q')
		specialty = self.request.query_params.get('specialty')
		is_approved = self.request.query_params.get('is_approved')
		qs = Doctor.objects.select_related('user').all()
		if specialty:
			qs = qs.filter(specialty__icontains=specialty)
		if is_approved is not None:
			# accept values like 'true'/'false' or '1'/'0'
			val = str(is_approved).lower()
			if val in ('true', '1'):
				qs = qs.filter(user__is_approved=True)
			elif val in ('false', '0'):
				qs = qs.filter(user__is_approved=False)
		if q:
			if q.isdigit():
				qs = qs.filter(user__id=int(q))
			else:
				qs = qs.filter(
					Q(user__username__icontains=q) |
					Q(user__email__icontains=q) |
					Q(specialty__icontains=q)
				)
		return qs

	def get_serializer_class(self):
		if self.request.method == 'POST':
			return AdminDoctorCreateSerializer
		return AdminDoctorSerializer


class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Doctor.objects.all()
	permission_classes = [IsAuthenticated, IsAdminRole]
	serializer_class = AdminDoctorSerializer

class AdminReclamationsListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        reclamations = Reclamation.objects.select_related(
            'patient', 'doctor'
        ).order_by('-created_at')

        statut = request.query_params.get('statut')
        if statut:
            reclamations = reclamations.filter(statut=statut)

        doctor_id = request.query_params.get('doctor')
        if doctor_id:
            reclamations = reclamations.filter(doctor_id=doctor_id)

        patient_id = request.query_params.get('patient')
        if patient_id:
            reclamations = reclamations.filter(patient_id=patient_id)

        serializer = AdminReclamationSerializer(reclamations, many=True)
        return Response(serializer.data)