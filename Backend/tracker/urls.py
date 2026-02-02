from rest_framework.routers import DefaultRouter
from .views import (
    HabitViewSet, TaskViewSet, SubTaskViewSet,
    FocusSessionViewSet, DailyMetricsViewSet,
    ReminderViewSet, StreakViewSet,
    AchievementViewSet, UserAchievementViewSet,
    SocialPodViewSet, UserPodViewSet
)

router = DefaultRouter()

router.register(r'habits', HabitViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'subtasks', SubTaskViewSet)
router.register(r'focus-sessions', FocusSessionViewSet)
router.register(r'daily-metrics', DailyMetricsViewSet)
router.register(r'reminders', ReminderViewSet)
router.register(r'streaks', StreakViewSet)
router.register(r'achievements', AchievementViewSet)
router.register(r'user-achievements', UserAchievementViewSet)
router.register(r'social-pods', SocialPodViewSet)
router.register(r'user-pods', UserPodViewSet)

urlpatterns = router.urls
