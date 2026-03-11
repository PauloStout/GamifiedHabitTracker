import os
import django
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from tracker.models import Habit
from django.utils import timezone


def run_test():
    try:
        habit = Habit.objects.get(id=79)

        # Set streak to 7 and last completed to yesterday
        habit.last_completed_date = timezone.now().date() - timedelta(days=1)
        habit.current_streak = 2
        habit.save()

        print(f"Success! Habit '{habit.habit_title}' (ID updated.")
        print(f"Streak: {habit.current_streak}, Last Done: {habit.last_completed_date}")

    except Habit.DoesNotExist:
        print("Error: Habit with ID 25 was not found in the database.")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    run_test()