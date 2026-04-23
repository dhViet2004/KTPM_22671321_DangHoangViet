from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

from .tasks import add_numbers


def home(request):
    return JsonResponse({"message": "Django is running"})


def trigger_task(request):
    task = add_numbers.delay(7, 8)
    return JsonResponse({"task_id": task.id, "status": "queued"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home),
    path("task/", trigger_task),
]
