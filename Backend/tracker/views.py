from django.http import JsonResponse
from rest_framework.viewsets import ModelViewSet
from .models import (
    Habit, Task, FocusSession, DailyMetrics,
    Reminder, Achievement, UserAchievement,
    SocialPod, UserPod, Streak, SubTask, UserProfile
)
from .serializers import (
    HabitSerializer, TaskSerializer, FocusSessionSerializer,
    DailyMetricsSerializer, ReminderSerializer,
    AchievementSerializer, UserAchievementSerializer,
    SocialPodSerializer, UserPodSerializer,
    StreakSerializer, SubTaskSerializer
)

class HabitViewSet(ModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer


class TaskViewSet(ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class SubTaskViewSet(ModelViewSet):
    queryset = SubTask.objects.all()
    serializer_class = SubTaskSerializer


class FocusSessionViewSet(ModelViewSet):
    queryset = FocusSession.objects.all()
    serializer_class = FocusSessionSerializer


class DailyMetricsViewSet(ModelViewSet):
    queryset = DailyMetrics.objects.all()
    serializer_class = DailyMetricsSerializer


class ReminderViewSet(ModelViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer


class StreakViewSet(ModelViewSet):
    queryset = Streak.objects.all()
    serializer_class = StreakSerializer


class AchievementViewSet(ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer


class UserAchievementViewSet(ModelViewSet):
    queryset = UserAchievement.objects.all()
    serializer_class = UserAchievementSerializer


class SocialPodViewSet(ModelViewSet):
    queryset = SocialPod.objects.all()
    serializer_class = SocialPodSerializer


class UserPodViewSet(ModelViewSet):
    queryset = UserPod.objects.all()
    serializer_class = UserPodSerializer


from tracker.models import UserProfile


def dashboard_data(request):
    users = UserProfile.objects.all().values(
        "user__username",
        "total_xp",
        "level",
        "streaks_enabled",
    )

    return JsonResponse({"users": list(users)})
