from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import (
    Habit, Task, FocusSession, DailyMetrics,
    Reminder, Achievement, UserAchievement,
    SocialPod, UserPod, Streak, SubTask
)
from .serializers import (
    HabitSerializer, TaskSerializer, FocusSessionSerializer,
    DailyMetricsSerializer, ReminderSerializer,
    AchievementSerializer, UserAchievementSerializer,
    SocialPodSerializer, UserPodSerializer,
    StreakSerializer, SubTaskSerializer
)

DIFFICULTY_XP = {
    "easy": 10,
    "medium": 25,
    "hard": 50,
}

class HabitViewSet(ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        difficulty = serializer.validated_data["habit_difficulty"]
        xp = DIFFICULTY_XP.get(difficulty, 10)
        serializer.save(user=self.request.user, xp_reward=xp)

    def perform_update(self, serializer):
        difficulty = serializer.validated_data.get("habit_difficulty")
        if difficulty:
            serializer.save(xp_reward=DIFFICULTY_XP.get(difficulty, 10))
        else:
            serializer.save()

class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        difficulty = serializer.validated_data["task_difficulty"]
        xp = DIFFICULTY_XP.get(difficulty, 10)
        serializer.save(user=self.request.user, xp_reward=xp)

    # ✅ Add "complete" action
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()

        if not task.is_completed:
            task.is_completed = True
            task.save()
            # Complete subtasks automatically
            task.subtasks.update(is_completed=True)

            profile = UserProfile.objects.get(user=request.user)
            profile.add_xp(task.xp_reward)

        return Response({
            "message": "Task completed",
            "xp_awarded": task.xp_reward,
            "total_xp": profile.total_xp,
            "level": profile.level,
        })


class SubTaskViewSet(ModelViewSet):
    queryset = SubTask.objects.all()
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    # ✅ Add "toggle" action
    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        subtask = self.get_object()
        subtask.is_completed = not subtask.is_completed
        subtask.save()

        return Response({
            "id": subtask.id,
            "is_completed": subtask.is_completed
        })

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


from django.http import JsonResponse
from tracker.models import UserProfile

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    # Ensure user is logged in
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    try:
        profile = UserProfile.objects.select_related("user").get(user=request.user)

        data = {
            "first_name": profile.user.first_name,
            "last_name": profile.user.last_name,
            "motivation": profile.motivation,
            "level": profile.level,
            "total_xp": profile.total_xp,
            "current_level_xp": profile.current_level_xp,
            "xp_for_next_level": profile.xp_for_next_level,
        }
        return JsonResponse(data)
    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)

@login_required
@require_POST
def add_xp(request):
    try:
        profile = UserProfile.objects.get(user=request.user)

        # Award 25 XP
        profile.add_xp(25)

        return JsonResponse({
            "total_xp": profile.total_xp,
            "level": profile.level,
            "current_level_xp": profile.current_level_xp,
            "xp_for_next_level": profile.xp_for_next_level,
        })

    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)

# views.py
@api_view(["POST"])
def add_habit(request):
    name = request.data.get("name")

    habit = Habit.objects.create(
        user=request.user,
        name=name,
        xp=0
    )

    return Response({
        "id": habit.id,
        "name": habit.name
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_habit(request, habit_id):
    try:
        # Get the habit for this user
        habit = Habit.objects.get(id=habit_id, user=request.user)
        profile = UserProfile.objects.get(user=request.user)

        # Add XP to the user profile
        profile.add_xp(habit.xp_reward)

        # MARK THE HABIT AS COMPLETED
        habit.is_completed = True
        habit.save()

        # Return updated info
        return JsonResponse({
            "xp_awarded": habit.xp_reward,
            "total_xp": profile.total_xp,
            "level": profile.level,
            "habit_id": habit.id,
            "is_completed": habit.is_completed
        })

    except Habit.DoesNotExist:
        return JsonResponse({"error": "Habit not found"}, status=404)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_task(request, task_id):
    try:
        task = Task.objects.get(id=task_id, user=request.user)

        if not task.is_completed:
            task.is_completed = True
            task.save()

            # Auto-complete all subtasks
            task.subtasks.update(is_completed=True)

            profile = UserProfile.objects.get(user=request.user)
            profile.add_xp(task.xp_reward)

        return Response({
            "message": "Task completed",
            "xp_awarded": task.xp_reward,
            "total_xp": profile.total_xp,
            "level": profile.level,
        })

    except Task.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_subtask(request, subtask_id):
    try:
        subtask = SubTask.objects.get(
            id=subtask_id,
            task__user=request.user
        )

        subtask.is_completed = not subtask.is_completed
        subtask.save()

        return Response({
            "id": subtask.id,
            "is_completed": subtask.is_completed
        })

    except SubTask.DoesNotExist:
        return Response({"error": "Subtask not found"}, status=404)

class FocusSessionViewSet(ModelViewSet):
    queryset = FocusSession.objects.all()
    serializer_class = FocusSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        duration = serializer.validated_data["duration_minutes"]
        sessions = serializer.validated_data["sessions_completed"]

        xp = duration * sessions

        # ✅ Get the user's profile properly
        profile = UserProfile.objects.get(user=self.request.user)

        # ✅ Use your existing XP system
        profile.add_xp(xp)

        # ✅ Save the focus session
        serializer.save(user=self.request.user, xp_earned=xp)

