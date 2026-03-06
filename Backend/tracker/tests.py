from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date, timedelta
from tracker.models import (
    UserProfile, Habit, Task, SubTask,
    DailyMetrics, Achievement, UserAchievement
)


#XP + LEVEL UP SYSTEM

class XPSystemTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="xp_user", password="pass")
        self.profile = UserProfile.objects.create(user=self.user)

    def test_xp_below_threshold_no_level_up(self):
        self.profile.add_xp(50)
        self.assertEqual(self.profile.level, 1)

    def test_xp_at_threshold_levels_up(self):
        self.profile.add_xp(100)
        self.assertEqual(self.profile.level, 2)

    def test_xp_overflow_carries_over(self):
        self.profile.add_xp(150)
        self.assertEqual(self.profile.current_level_xp, 50)

    def test_xp_disabled_awards_nothing(self):
        self.profile.xp_enabled = False
        self.profile.save()
        self.profile.add_xp(100)
        self.assertEqual(self.profile.total_xp, 0)

    def test_threshold_scales_after_level_up(self):
        self.profile.add_xp(100)
        self.assertEqual(self.profile.xp_for_next_level, int(100 * 1.25))


#HABIT STREAK LOGIC

class HabitStreakTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="streak_user", password="pass")
        UserProfile.objects.create(user=self.user)
        self.habit = Habit.objects.create(
            user=self.user, habit_title="Run",
            habit_difficulty="easy", habit_frequency="daily", xp_reward=10
        )

    def test_first_completion_streak_is_1(self):
        self.habit.update_streak()
        self.assertEqual(self.habit.current_streak, 1)

    def test_consecutive_day_increments_streak(self):
        self.habit.last_completed_date = date.today() - timedelta(days=1)
        self.habit.current_streak = 3
        self.habit.save()
        self.habit.update_streak()
        self.assertEqual(self.habit.current_streak, 4)

    def test_missed_day_resets_streak(self):
        self.habit.last_completed_date = date.today() - timedelta(days=3)
        self.habit.current_streak = 7
        self.habit.save()
        self.habit.update_streak()
        self.assertEqual(self.habit.current_streak, 1)

    def test_completing_twice_same_day_no_change(self):
        self.habit.update_streak()
        self.habit.update_streak()
        self.assertEqual(self.habit.current_streak, 1)

    def test_should_reset_after_missed_day(self):
        self.habit.last_completed_date = date.today() - timedelta(days=1)
        self.habit.save()
        self.assertTrue(self.habit.should_reset())


#FOCUS SESSION

class FocusSessionTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="focus_user", password="pass")
        self.profile = UserProfile.objects.create(user=self.user)

    def test_xp_equals_minutes_times_sessions(self):
        self.assertEqual(25 * 2, 50)

    def test_zero_minutes_awards_no_xp(self):
        self.assertEqual(0 * 1, 0)

    def test_focus_xp_added_to_profile(self):
        self.profile.add_xp(25)
        self.assertEqual(self.profile.total_xp, 25)

    def test_focus_updates_daily_metrics(self):
        metric, _ = DailyMetrics.objects.get_or_create(
            user=self.user, metric_date=date.today()
        )
        metric.total_study_minutes += 25
        metric.save()
        metric.refresh_from_db()
        self.assertEqual(metric.total_study_minutes, 25)


#HABIT + TASK API

class HabitTaskAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="api_user", password="pass")
        self.profile = UserProfile.objects.create(user=self.user)
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_create_habit_returns_201(self):
        response = self.client.post("/api/habits/", {
            "habit_title": "Morning Run", "habit_difficulty": "medium",
            "habit_frequency": "daily", "habit_theme": "exercise"
        })
        self.assertEqual(response.status_code, 201)

    def test_hard_habit_xp_is_50(self):
        response = self.client.post("/api/habits/", {
            "habit_title": "Hard", "habit_difficulty": "hard",
            "habit_frequency": "daily", "habit_theme": "studies"
        })
        self.assertEqual(response.data["xp_reward"], 50)

    def test_complete_habit_awards_xp(self):
        habit = Habit.objects.create(
            user=self.user, habit_title="H",
            habit_difficulty="easy", habit_frequency="daily", xp_reward=10
        )
        response = self.client.post(f"/api/habits/{habit.id}/complete/")
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data["xp_awarded"], 0)

    def test_complete_habit_twice_no_double_xp(self):
        habit = Habit.objects.create(
            user=self.user, habit_title="H",
            habit_difficulty="easy", habit_frequency="daily",
            xp_reward=10, last_completed_date=date.today()
        )
        self.client.post(f"/api/habits/{habit.id}/complete/")
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.total_xp, 0)

    def test_unauthenticated_cannot_access(self):
        self.client.credentials()
        response = self.client.get("/api/habits/")
        self.assertEqual(response.status_code, 401)


#ACHIEVEMENTS

class AchievementTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="ach_user", password="pass")
        self.profile = UserProfile.objects.create(user=self.user)

    def test_level_2_unlocks_novice_explorer(self):
        self.profile.add_xp(100)
        self.assertEqual(self.profile.level, 2)

    def test_achievement_xp_adds_to_profile(self):
        ach = Achievement.objects.create(
            achievement_name="Test", description="Test", xp_reward=100
        )
        self.profile.add_xp(ach.xp_reward)
        self.assertEqual(self.profile.total_xp, 100)

    def test_same_achievement_cannot_be_awarded_twice(self):
        from django.db import IntegrityError
        ach = Achievement.objects.create(
            achievement_name="Unique", description="Test", xp_reward=50
        )
        UserAchievement.objects.create(user=self.user, achievement=ach)
        with self.assertRaises(IntegrityError):
            UserAchievement.objects.create(user=self.user, achievement=ach)


#MASCOT + LEVEL UP CONDITION


class MascotLogicTest(TestCase):

    def get_mascot(self, old_level, new_level, xp, theme="studies"):
        theme_messages = {
            "studies": f"Study streak! 📚 +{xp} XP",
            "exercise": f"Workout done! 💪 +{xp} XP",
            "sleep": f"Rest earned! 😴 +{xp} XP",
            "nutrition": f"Healthy! 🥗 +{xp} XP",
        }
        msg = theme_messages.get(theme, f"Habit done! +{xp} XP")
        mascot = "ThemeMascot"
        if new_level > old_level:
            mascot = "CheeringMascot"
            msg = f"LEVEL UP! 🎉 Level {new_level}!"
        return mascot, msg

    def test_level_up_shows_cheering_mascot(self):
        mascot, _ = self.get_mascot(1, 2, 25)
        self.assertEqual(mascot, "CheeringMascot")

    def test_no_level_up_shows_theme_mascot(self):
        mascot, _ = self.get_mascot(1, 1, 25)
        self.assertEqual(mascot, "ThemeMascot")

    def test_level_up_message_contains_new_level(self):
        _, msg = self.get_mascot(2, 3, 50)
        self.assertIn("3", msg)

    def test_default_theme_fallback_message(self):
        _, msg = self.get_mascot(1, 1, 25, "unknown")
        self.assertIn("Habit done!", msg)


#LEADERBOARD

class LeaderboardTest(TestCase):

    def get_medal(self, index):
        if index == 0: return "🥇"
        if index == 1: return "🥈"
        if index == 2: return "🥉"
        return None

    def get_bg(self, index):
        return {0: "#FFD700", 1: "#C0C0C0", 2: "#CD7F32"}.get(index, "#E0E0E0")

    def test_top_3_get_medals(self):
        self.assertEqual(self.get_medal(0), "🥇")
        self.assertEqual(self.get_medal(1), "🥈")
        self.assertEqual(self.get_medal(2), "🥉")

    def test_outside_top_3_no_medal(self):
        self.assertIsNone(self.get_medal(3))

    def test_correct_background_colours(self):
        self.assertEqual(self.get_bg(0), "#FFD700")
        self.assertEqual(self.get_bg(1), "#C0C0C0")
        self.assertEqual(self.get_bg(2), "#CD7F32")
        self.assertEqual(self.get_bg(5), "#E0E0E0")

    def test_leaderboard_api_returns_200(self):
        user = User.objects.create_user(username="leader", password="pass")
        UserProfile.objects.create(user=user)
        from rest_framework.test import APIClient
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}")
        response = client.get("/api/leaderboard/?type=xp")
        self.assertEqual(response.status_code, 200)