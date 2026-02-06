from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.serializers import RegisterSerializer


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Create JWT tokens immediately
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "username": user.username,
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
