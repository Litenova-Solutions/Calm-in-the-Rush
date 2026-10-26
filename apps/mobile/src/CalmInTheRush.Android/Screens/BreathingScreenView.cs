namespace CalmInTheRush.Android.Screens;

using global::Android.Content;
using global::Android.Graphics;
using global::Android.Graphics.Drawables;
using global::Android.OS;
using global::Android.Util;
using global::Android.Views;
using global::Android.Widget;
using CalmInTheRush.Android.Chrome;
using CalmInTheRush.Android.Motion;
using CalmInTheRush.Android.Ui;
using CalmInTheRush.Domain.Experiences;

public sealed class BreathingScreenView : FrameLayout
{
    public BreathingScreenView(Context context, BreathingScreen screen)
        : base(context)
    {
        SetBackgroundColor(context.ColorOf(Resource.Color.calm_background));

        var scroll = new ScrollView(context)
        {
            LayoutParameters = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.MatchParent),
        };
        AddView(scroll);

        var column = new LinearLayout(context)
        {
            Orientation = Orientation.Vertical,
            LayoutParameters = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent),
        };
        column.SetGravity(GravityFlags.CenterHorizontal);
        var side = Units.Dp(context, 20);
        column.SetPaddingRelative(side, Units.Dp(context, 56), side, Units.Dp(context, 96));
        SystemInsets.Track(this, (top, _) => column.SetPaddingRelative(side, Units.Dp(context, 56) + top, side, Units.Dp(context, 96)));
        scroll.AddView(column);

        var title = new TextView(context)
        {
            Text = screen.Title,
            Gravity = GravityFlags.Center,
            LayoutParameters = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WrapContent, ViewGroup.LayoutParams.WrapContent),
        };
        title.SetTextSize(ComplexUnitType.Sp, 24);
        title.SetTextColor(context.ColorOf(Resource.Color.calm_foreground));
        title.SetMaxWidth(Units.Dp(context, 288));
        if (OperatingSystem.IsAndroidVersionAtLeast(28))
        {
            title.AccessibilityHeading = true;
        }

        column.AddView(title);

        var description = new TextView(context)
        {
            Text = screen.Description,
            Gravity = GravityFlags.Center,
        };
        description.SetTextSize(ComplexUnitType.Sp, 14);
        description.SetTextColor(context.ColorOf(Resource.Color.calm_muted_foreground));
        description.SetLineSpacing(0f, 1.625f);
        description.SetMaxWidth(Units.Dp(context, 288));
        var descriptionParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WrapContent, ViewGroup.LayoutParams.WrapContent);
        descriptionParams.TopMargin = Units.Dp(context, 8);
        description.LayoutParameters = descriptionParams;
        column.AddView(description);

        var primary = context.ColorOf(Resource.Color.calm_primary);
        var frame = new GradientDrawable();
        frame.SetShape(ShapeType.Rectangle);
        frame.SetColor(Color.Transparent);
        frame.SetCornerRadius(Units.Dp(context, 24));
        frame.SetStroke(Units.Dp(context, 1), Color.Argb(38, primary.R, primary.G, primary.B));

        var wave = new BreathingWaveView(context)
        {
            Background = frame,
        };
        var waveWidth = Math.Min(Units.Dp(context, 320), Math.Max(1, DisplayWidth(context) - (side * 2)));
        var waveParams = new LinearLayout.LayoutParams(waveWidth, waveWidth * 180 / 320);
        waveParams.TopMargin = Units.Dp(context, 36);
        wave.LayoutParameters = waveParams;
        column.AddView(wave);
    }

    private static int DisplayWidth(Context context)
    {
        var resources = context.Resources;
        if (resources is null)
        {
            return Units.Dp(context, 360);
        }

        var metrics = resources.DisplayMetrics;
        if (metrics is null)
        {
            return Units.Dp(context, 360);
        }

        return metrics.WidthPixels;
    }
}
