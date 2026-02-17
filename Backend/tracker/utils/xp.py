from tracker.models import UserProfile

THEME_BONUS_MULTIPLIER = 1.5

#Returns level based on total XP | increasing difficulty per level.
def xp_progress(total_xp: int):

    level = 1
    xp_needed = 100

    while total_xp >= xp_needed:
        total_xp -= xp_needed
        level += 1
        xp_needed = int(xp_needed * 1.25)

    return {
        "current_level_xp": total_xp,
        "xp_for_next_level": xp_needed
    }

def award_xp(user, base_xp, obj_theme=None):
    """
    Awards XP to a user, applying theme bonus if applicable.

    Args:
        user: Django User instance
        base_xp: int, XP from the task/habit
        obj_theme: str, the theme of the task/habit (optional)
    Returns:
        xp_awarded: int, actual XP awarded
        profile: UserProfile instance
    """
    profile = UserProfile.objects.get(user=user)
    xp_to_award = base_xp

    if obj_theme and profile.primary_theme == obj_theme:
        xp_to_award = int(xp_to_award * THEME_BONUS_MULTIPLIER)

    profile.add_xp(xp_to_award)
    return xp_to_award, profile
