from django.http import HttpResponse
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView


def home(request):
    return HttpResponse("Kangaroutine API is running")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include('tracker.urls')),
    path('api/auth/', include('accounts.urls')),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh")
]
