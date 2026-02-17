from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from .views import (
    HabitViewSet, TaskViewSet, SubTaskViewSet,
    FocusSessionViewSet, DailyMetricsViewSet,
    ReminderViewSet, AchievementViewSet,
    UserAchievementViewSet, SocialPodViewSet,
    UserPodViewSet, dashboard_data,
    complete_habit, add_habit, leaderboard_view,
)

router = DefaultRouter()
router.register(r'habits', HabitViewSet, basename="habit")
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r'subtasks', SubTaskViewSet)
router.register(r'focus-sessions', FocusSessionViewSet)
router.register(r'daily-metrics', DailyMetricsViewSet)
router.register(r'reminders', ReminderViewSet)
router.register(r'achievements', AchievementViewSet)
router.register(r'user-achievements', UserAchievementViewSet)
router.register(r'social-pods', SocialPodViewSet)
router.register(r'user-pods', UserPodViewSet)

urlpatterns = [
    path("dashboard/", dashboard_data),
    path('', include(router.urls)),
    path('api/auth/', include('accounts.urls')),
    path("", include(router.urls)),
    path("habits/<int:habit_id>/complete/", complete_habit),
    path("habits/add/", add_habit),
    path('api/subtasks/<int:subtask_id>/toggle/', views.toggle_subtask, name='toggle-subtask'),
    path("leaderboard/", leaderboard_view),
    path("progress/", views.user_progress),
]