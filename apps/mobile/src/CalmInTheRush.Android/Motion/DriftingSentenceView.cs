using global::Android.Animation;
using global::Android.Content;
using global::Android.Graphics;
using global::Android.Util;
using global::Android.Views;
using global::Android.Views.Animations;
using global::Android.Widget;
using CalmInTheRush.Android.Ui;

namespace CalmInTheRush.Android.Motion;

public sealed class DriftingSentenceView : TextView
{
    readonly Context context;
    ObjectAnimator? drift;

    public DriftingSentenceView(Context context)
        : base(context)
    {
        this.context = context;
        Gravity = GravityFlags.Start;
        SetTextSize(ComplexUnitType.Sp, 16);
        SetTextColor(WithAlpha(context.ColorOf(Resource.Color.calm_stage_foreground), 0.85));
        SetTypeface(Typeface.Default, TypefaceStyle.Normal);
        SetLineSpacing(0, 1.625f);
    }

    protected override void OnAttachedToWindow()
    {
        base.OnAttachedToWindow();
        if (MotionPreference.IsReduced(context))
        {
            return;
        }

        // Five seconds each way: the full down-and-back drift takes ten seconds like the CSS keyframes.
        float distance = -Units.Dp(context, 4);
        ObjectAnimator? created = ObjectAnimator.OfFloat(this, "translationY", 0f, distance);
        if (created is null)
        {
            return;
        }

        created.SetDuration(5000);
        created.RepeatCount = ValueAnimator.Infinite;
        created.RepeatMode = ValueAnimatorRepeatMode.Reverse;
        created.SetInterpolator(new AccelerateDecelerateInterpolator());
        drift = created;
        created.Start();
    }

    protected override void OnDetachedFromWindow()
    {
        drift?.Cancel();
        drift = null;
        TranslationY = 0;
        base.OnDetachedFromWindow();
    }

    static Color WithAlpha(Color color, double fraction) =>
        Color.Argb((int)Math.Round(byte.MaxValue * fraction), color.R, color.G, color.B);
}
