using global::Android.Content;
using global::Android.Util;

namespace CalmInTheRush.Android.Ui;

public static class Units
{
    public static int Dp(Context context, float dp) =>
        (int)TypedValue.ApplyDimension(ComplexUnitType.Dip, dp, context.Resources!.DisplayMetrics);
}
