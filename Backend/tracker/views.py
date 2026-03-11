from datetime import timedelta
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Max
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import (
    Habit, Task, FocusSession, DailyMetrics,
    Reminder, Achievement, UserAchievement,
    SocialPod, UserPod, SubTask, UserProfile,
)
from .serializers import (
    HabitSerializer, TaskSerializer, FocusSessionSerializer,
    DailyMetricsSerializer, ReminderSerializer,
    AchievementSerializer, UserAchievementSerializer,
    SocialPodSerializer, UserPodSerializer, SubTaskSerializer
)
from .utils.metrics import update_daily_xp
from .utils.xp import award_xp

DIFFICULTY_XP = {
    "easy": 10,
    "medium": 25,
    "hard": 50,
}

THEME_BONUS_MULTIPLIER = 1.5

class HabitViewSet(ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        habits = Habit.objects.filter(user=self.request.user)

        today = timezone.now().date()

        for habit in habits:
            if habit.should_reset():
                #if user missed yesterday → reset streak
                yesterday = today - timezone.timedelta(days=1)

                if habit.last_completed_date and habit.last_completed_date < yesterday:
                    habit.current_streak = 0

                habit.is_completed = False
                habit.save()

        return habits

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

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()
        profile = UserProfile.objects.get(user=request.user)

        if task.is_completed:
            return Response({
                "message": "Task already completed",
                "xp_awarded": 0,
                "total_xp": profile.total_xp,
                "level": profile.level,
            })

        task.is_completed = True
        task.save()
        task.subtasks.update(is_completed=True)

        xp_awarded, profile = award_xp(
            request.user,
            base_xp=task.xp_reward,
            obj_theme=task.task_theme
        )

        #update DailyMetrics
        today = timezone.now().date()
        daily_metric, _ = DailyMetrics.objects.get_or_create(
            user=request.user,
            metric_date=today
        )

        daily_metric.xp_earned += xp_awarded
        daily_metric.save()

        return Response({
            "message": "Task completed",
            "xp_awarded": xp_awarded,
            "total_xp": profile.total_xp,
            "level": profile.level,
        })


class SubTaskViewSet(ModelViewSet):
    queryset = SubTask.objects.all()
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_data(request):


    #checks user is logged in
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
        habit = Habit.objects.get(id=habit_id, user=request.user)
        today = timezone.now().date()
        xp_awarded = 0  #defaults if already completed today

        if habit.last_completed_date != today:
            habit.is_completed = True
            habit.update_streak()  #updates the streak in the DB
            xp_awarded, profile = award_xp(
                request.user,
                base_xp=habit.xp_reward,
                obj_theme=habit.habit_theme
            )
            update_daily_xp(user=request.user, xp=xp_awarded)
        else:
            # If already completed, needs profile for the response
            profile = request.user.userprofile

        return JsonResponse({
            "xp_awarded": xp_awarded,
            "total_xp": profile.total_xp,
            "level": profile.level,
            "habit_id": habit.id,
            "is_completed": habit.is_completed,
            "current_streak": habit.current_streak
        })

    except Habit.DoesNotExist:
        return JsonResponse({"error": "Habit not found"}, status=404)

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
        sessions = serializer.validated_data.get("sessions_completed", 1)

        total_minutes = duration * sessions
        xp_to_award = total_minutes  # 1 XP per minute

        today = timezone.now().date()

        xp_awarded, profile = award_xp(
            self.request.user,
            base_xp=xp_to_award,
            obj_theme=None  # focus sessions don’t use themes
        )

        daily_metric, _ = DailyMetrics.objects.get_or_create(
            user=self.request.user,
            metric_date=today
        )

        daily_metric.total_study_minutes += total_minutes
        daily_metric.xp_earned += xp_awarded
        daily_metric.save()

        serializer.save(
            user=self.request.user,
            xp_earned=xp_awarded
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard_view(request):
    board_type = request.GET.get("type", "xp")
    today = timezone.now().date()
    start_week = today - timedelta(days=6)

    if board_type == "xp":
        results = (
            DailyMetrics.objects
            .filter(metric_date__gte=start_week)
            .values("user__first_name", "user__userprofile__level")
            .annotate(total=Sum("xp_earned"))
            .order_by("-total")[:10]
        )

        data = [
            {
                "name": r["user__first_name"],
                "level": r["user__userprofile__level"],
                "value": r["total"] or 0
            }
            for r in results
        ]

    elif board_type == "focus":
        results = (
            DailyMetrics.objects
            .filter(metric_date__gte=start_week)
            .values("user__first_name", "user__userprofile__level")
            .annotate(total=Sum("total_study_minutes"))
            .order_by("-total")[:10]
        )

        data = [
            {
                "name": r["user__first_name"],
                "level": r["user__userprofile__level"], # Added this
                "value": r["total"] or 0
            }
            for r in results
        ]

    elif board_type == "streak":
        profiles = UserProfile.objects.select_related("user")
        profiles = sorted(
            profiles,
            key=lambda p: max([h.current_streak for h in p.user.habits.all()] or [0]),
            reverse=True
        )[:10]

        data = [
            {
                "name": p.user.first_name,
                "level": p.level, # Added this (p is a UserProfile object)
                "value": max([h.current_streak for h in p.user.habits.all()] or [0])
            }
            for p in profiles
        ]

    else:
        return Response({"error": "Invalid leaderboard type"}, status=400)

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_progress(request):
    today = timezone.now().date()
    start_date = today - timedelta(days=6)

    metrics = (
        DailyMetrics.objects
        .filter(user=request.user, metric_date__gte=start_date)
        .order_by("metric_date")
    )

    data = []

    for metric in metrics:
        week_start = metric.metric_date - timedelta(days=6)

        weekly_xp = (
            DailyMetrics.objects
            .filter(user=request.user,
                    metric_date__gte=week_start,
                    metric_date__lte=metric.metric_date)
            .aggregate(total=Sum("xp_earned"))["total"] or 0
        )

        data.append({
            "date": metric.metric_date.strftime("%d %b"),
            "weekly_xp": weekly_xp, ##keeps the weekly sum in case you want it elsewhere
            "daily_xp": metric.xp_earned,
            "focus_minutes": metric.total_study_minutes,
            "streak": metric.habits_completed,
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_achievements(request):
    user = request.user

    try:
        profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    # 1. Define Standard Achievements
    standard_achievements = [
        {"name": "Novice Explorer", "desc": "Reach Level 2", "xp": 50, "icon": "🌟"},
        {"name": "Adept", "desc": "Reach Level 5", "xp": 100, "icon": "⭐"},
        {"name": "XP Hoarder", "desc": "Accumulate 1000 Total XP", "xp": 200, "icon": "💰"},
        {"name": "Streak Starter", "desc": "Achieve a 3-day habit streak", "xp": 50, "icon": "🔥"},
        {"name": "Consistency Key", "desc": "Achieve a 7-day habit streak", "xp": 150, "icon": "📅"},
        {"name": "Focus Initiate", "desc": "Log 60 minutes of focus time", "xp": 50, "icon": "🧠"},
        {"name": "Deep Worker", "desc": "Log 300 minutes of focus time", "xp": 150, "icon": "🧘"},
    ]

    # Create them in the DB if they don't exist
    for ach_data in standard_achievements:
        Achievement.objects.get_or_create(
            achievement_name=ach_data["name"],
            defaults={
                "description": ach_data["desc"],
                "xp_reward": ach_data["xp"],
                "icon_url": ach_data["icon"]
            }
        )

    max_streak_dict = Habit.objects.filter(user=user).aggregate(Max('longest_streak'))
    max_streak = max_streak_dict['longest_streak__max'] or 0
    total_focus_dict = DailyMetrics.objects.filter(user=user).aggregate(Sum('total_study_minutes'))
    total_focus = total_focus_dict['total_study_minutes__sum'] or 0
    all_achievements = Achievement.objects.all()
    unlocked_ids = set(UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True))

    newly_unlocked = []

    for ach in all_achievements:
        if ach.id in unlocked_ids:
            continue  #already unlocked
        earned = False #checks achievement unlock
        if ach.achievement_name == "Novice Explorer" and profile.level >= 2:
            earned = True
        elif ach.achievement_name == "Adept" and profile.level >= 5:
            earned = True
        elif ach.achievement_name == "XP Hoarder" and profile.total_xp >= 1000:
            earned = True
        if earned:
            UserAchievement.objects.create(user=user, achievement=ach)
            profile.add_xp(ach.xp_reward)  # Award XP for the achievement!
            unlocked_ids.add(ach.id)
            newly_unlocked.append(ach.achievement_name)

    # 4. Format Data for React
    data = []
    for ach in all_achievements:
        data.append({
            "id": ach.id,
            "name": ach.achievement_name,
            "description": ach.description,
            "icon": ach.icon_url,
            "xp_reward": ach.xp_reward,
            "unlocked": ach.id in unlocked_ids
        })

    return Response({
        "achievements": data,
        "newly_unlocked": newly_unlocked,
        "total_xp": profile.total_xp,
        "level": profile.level
    })