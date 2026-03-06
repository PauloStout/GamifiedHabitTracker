import os
import django
from datetime import timedelta

# 1. Setup Django Environment
# Replace 'Backend' with your actual folder name that contains settings.py 
# (usually the folder with the same name as your project)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

# 2. NOW you can import your models
from tracker.models import Habit
from django.utils import timezone


def run_test():
    try:
        habit = Habit.objects.get(id=63)

        # Set streak to 7 and last completed to yesterday
        habit.last_completed_date = timezone.now().date() - timedelta(days=1)
        habit.current_streak = 7
        habit.save()

        print(f"Success! Habit '{habit.habit_title}' (ID updated.")
        print(f"Streak: {habit.current_streak}, Last Done: {habit.last_completed_date}")

    except Habit.DoesNotExist:
        print("Error: Habit with ID 25 was not found in the database.")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    run_test()