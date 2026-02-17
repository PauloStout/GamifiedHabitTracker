from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# -----------------------------
# USER PROFILE (extends Django User)
# -----------------------------
class UserProfile(models.Model):
    # -----------------------------
    # THEME SYSTEM
    # -----------------------------
    THEME_CHOICES = [
        ("studies", "Studies"),
        ("exercise", "Exercise"),
        ("sleep", "Sleep"),
        ("nutrition", "Nutrition"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # -----------------------------
    # GAMIFICATION CORE
    # -----------------------------
    level = models.IntegerField(default=1)
    total_xp = models.IntegerField(default=0)
    current_level_xp = models.IntegerField(default=0)
    xp_for_next_level = models.IntegerField(default=100)

    # -----------------------------
    # PERSONALISATION
    # -----------------------------
    motivation = models.CharField(max_length=255, blank=True)

    primary_theme = models.CharField(
        max_length=50,
        choices=THEME_CHOICES,
        default="studies"
    )

    # -----------------------------
    # FEATURE TOGGLES
    # -----------------------------
    dark_mode_enabled = models.BooleanField(default=False)
    xp_enabled = models.BooleanField(default=True)
    streaks_enabled = models.BooleanField(default=True)
    leaderboards_enabled = models.BooleanField(default=True)

    date_created = models.DateTimeField(auto_now_add=True)

    # -----------------------------
    # XP SYSTEM
    # -----------------------------
    def add_xp(self, xp):
        if not self.xp_enabled:
            return

        self.total_xp += xp
        self.current_level_xp += xp

        while self.current_level_xp >= self.xp_for_next_level:
            self.current_level_xp -= self.xp_for_next_level
            self.level += 1
            self.xp_for_next_level = int(self.xp_for_next_level * 1.25)

        self.save()

    def __str__(self):
        return self.user.first_name

# -----------------------------
# HABITS
# -----------------------------
class Habit(models.Model):

    THEME_CHOICES = [
        ("studies", "Studies"),
        ("exercise", "Exercise"),
        ("sleep", "Sleep"),
        ("nutrition", "Nutrition"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="habits")

    habit_title = models.CharField(max_length=100)
    habit_notes = models.TextField(blank=True)

    habit_theme = models.CharField(
        max_length=50,
        choices=THEME_CHOICES,
        default="studies"
    )

    habit_difficulty = models.CharField(max_length=50)
    habit_frequency = models.CharField(max_length=50)  # daily, weekly

    xp_reward = models.IntegerField(default=0)

    is_completed = models.BooleanField(default=False)
    last_completed_date = models.DateField(null=True, blank=True)

    # 🔥 STREAK SYSTEM
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)

    def should_reset(self):
        if self.habit_frequency == "daily":
            if self.last_completed_date:
                return self.last_completed_date < timezone.now().date()
        return False

    def update_streak(self):
        today = timezone.now().date()

        if self.last_completed_date == today:
            return  # already counted today

        yesterday = today - timezone.timedelta(days=1)

        if self.last_completed_date == yesterday:
            self.current_streak += 1
        else:
            self.current_streak = 1  # restart streak

        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak

        self.last_completed_date = today
        self.save()

    def __str__(self):
        return self.habit_title




# -----------------------------
# TASKS (one-off)
# -----------------------------
class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    task_title = models.CharField(max_length=100)
    task_notes = models.TextField(blank=True)
    task_difficulty = models.CharField(max_length=50)
    xp_reward = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    task_theme = models.CharField(max_length=50, choices=Habit.THEME_CHOICES, default="studies")

    def is_overdue(self):
        if self.deadline:
            return timezone.now() > self.deadline
        if self.due_date:
            return timezone.now().date() > self.due_date
        return False

    def __str__(self):
        return self.task_title


# -----------------------------
# SUBTASKS (for habits OR tasks)
# -----------------------------
class SubTask(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="subtasks"
    )
    description = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.description


# -----------------------------
# FOCUS / POMODORO SESSIONS
# -----------------------------
class FocusSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    duration_minutes = models.IntegerField()
    sessions_completed = models.IntegerField(default=1)
    xp_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.duration_minutes}min x{self.sessions_completed}"


# -----------------------------
# DAILY METRICS (progress tracking)
# -----------------------------
class DailyMetrics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    metric_date = models.DateField()
    total_study_minutes = models.IntegerField(default=0)
    total_tasks_completed = models.IntegerField(default=0)
    habits_completed = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)

    # NEW WEEKLY AGGREGATES
    weekly_xp = models.IntegerField(default=0)
    weekly_focus_minutes = models.IntegerField(default=0)

    class Meta:
        unique_together = ("user", "metric_date")

    def __str__(self):
        return f"{self.user.first_name} - {self.metric_date}"

# -----------------------------
# REMINDERS
# -----------------------------
class Reminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    habit = models.ForeignKey(Habit, null=True, blank=True, on_delete=models.SET_NULL)
    task = models.ForeignKey(Task, null=True, blank=True, on_delete=models.SET_NULL)

    reminder_type = models.CharField(max_length=50)  # preset / custom
    scheduled_time = models.DateTimeField()
    reminders_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"Reminder for {self.user.first_name}"


# -----------------------------
# ACHIEVEMENTS
# -----------------------------
class Achievement(models.Model):
    achievement_name = models.CharField(max_length=100)
    description = models.TextField()
    icon_url = models.CharField(max_length=255, blank=True)
    xp_reward = models.IntegerField(default=0)

    def __str__(self):
        return self.achievement_name


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    date_achieved = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "achievement")


# -----------------------------
# SOCIAL PODS
# -----------------------------
class SocialPod(models.Model):
    pod_name = models.CharField(max_length=100)
    pod_category = models.CharField(max_length=50)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.pod_name


class UserPod(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pod = models.ForeignKey(SocialPod, on_delete=models.CASCADE)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "pod")



