from django.http import HttpResponse
from django.contrib import admin
from django.urls import path, include

def home(request):
    return HttpResponse("Kangaroutine API is running")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include('tracker.urls')),

    path('api/auth/', include('accounts.urls')),

]
