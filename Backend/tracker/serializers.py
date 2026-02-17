from rest_framework import serializers
from .models import (
    Habit, Task, FocusSession, DailyMetrics,
    Reminder, Achievement, UserAchievement,
    SocialPod, UserPod, Streak, SubTask
)

class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = "__all__"
        read_only_fields = ("user", "xp_reward")


class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ["id", "description", "is_completed"]

class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubTaskSerializer(many=True, required=False)

    class Meta:
        model = Task
        fields = [
            "id",
            "task_title",
            "task_notes",
            "task_difficulty",
            "xp_reward",
            "is_completed",
            "due_date",
            "deadline",
            "subtasks",
        ]

    def create(self, validated_data):
        subtasks_data = validated_data.pop("subtasks", [])
        task = Task.objects.create(**validated_data)  # user is added by perform_create

        for subtask_data in subtasks_data:
            SubTask.objects.create(task=task, **subtask_data)

        return task

class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = "__all__"
        read_only_fields = ("user", "xp_earned", "created_at")

class DailyMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMetrics
        fields = '__all__'

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = '__all__'


class StreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streak
        fields = '__all__'


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'


class UserAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAchievement
        fields = '__all__'


class SocialPodSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialPod
        fields = '__all__'


class UserPodSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPod
        fields = '__all__'


