from django.utils import timezone
from datetime import date, timedelta
from tracker.models import DailyMetrics

def update_daily_metrics(user, xp=0, focus_minutes=0, completed_date=None):
    """
    Updates the user's daily metrics for today (or given date)
    """
    completed_date = completed_date or date.today()
    metrics, created = DailyMetrics.objects.get_or_create(user=user, date=completed_date)
    metrics.weekly_xp += xp
    metrics.weekly_focus_minutes += focus_minutes
    metrics.save()
    return metrics

def reset_weekly_leaderboards():
    today = timezone.now().date()

    # If today is Monday → reset
    if today.weekday() == 0:
        DailyMetrics.objects.update(
            weekly_xp=0,
            weekly_focus_minutes=0
        )

def update_daily_xp(user, xp=0, completed_date=None):
    completed_date = completed_date or timezone.now().date()

    metrics, _ = DailyMetrics.objects.get_or_create(
        user=user,
        metric_date=completed_date
    )

    metrics.xp_earned += xp
    metrics.save()

    return metrics