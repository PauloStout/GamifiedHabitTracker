import os
import django

# 1. Set the environment variable to point to your project's settings
# Replace 'GamifiedHabitTracker.settings' with 'your_project_name.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

# 2. Initialize Django
django.setup()

# 3. NOW you can import your models
from django.contrib.auth.models import User
from tracker.models import UserProfile


def test_add_xp_to_user(user_id, xp_amount):
    try:
        profile = UserProfile.objects.get(user_id=user_id)

        print(f"--- Before Update ---")
        print(f"User: {profile.user.username} (ID: {user_id})")
        print(f"Level: {profile.level}")
        print(f"Total XP: {profile.total_xp}")

        profile.add_xp(xp_amount)

        print(f"\n--- After Update ---")
        print(f"Added: {xp_amount} XP")
        print(f"New Level: {profile.level}")
        print(f"New Total XP: {profile.total_xp}")

    except UserProfile.DoesNotExist:
        print(f"Error: UserProfile with User ID {user_id} not found.")


if __name__ == "__main__":
    test_add_xp_to_user(user_id=14, xp_amount=500)