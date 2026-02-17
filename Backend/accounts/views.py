from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.serializers import RegisterSerializer
from tracker.models import UserProfile


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Create JWT tokens immediately
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "user_id": user.id,           # ✅ Add user ID
                    "username": user.username,
                    "email": user.email,           # optional
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckUserView(APIView):
    """
    Check if a username/email exists in the system.
    """
    def post(self, request):
        username_or_email = request.data.get("username_or_email")
        if not username_or_email:
            return Response({"error": "No input provided"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username_or_email).first() or \
               User.objects.filter(email=username_or_email).first()

        return Response({"exists": bool(user)})

# accounts/views.py
class CompleteProfileView(APIView):
    def post(self, request):
        user_id = request.data.get("user_id")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        motivation = request.data.get("motivation")
        primary_theme = request.data.get("primary_theme")

        if not user_id:
            return Response({"error": "Missing user_id"}, status=400)

        user = User.objects.get(id=user_id)
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.motivation = motivation

        if primary_theme:
            profile.primary_theme = primary_theme

        profile.save()

        return Response({"success": True})
