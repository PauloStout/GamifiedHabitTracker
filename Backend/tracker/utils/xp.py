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
