using global::Android.Animation;
using global::Android.Content;

namespace CalmInTheRush.Android.Ui;

public static class MotionPreference
{
    public static bool IsReduced(Context context)
    {
        _ = context;
        return !ValueAnimator.AreAnimatorsEnabled();
    }
}
