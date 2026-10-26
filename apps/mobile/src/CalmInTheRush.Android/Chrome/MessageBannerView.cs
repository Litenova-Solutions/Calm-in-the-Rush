namespace CalmInTheRush.Android.Chrome;

using global::Android.Content;
using global::Android.Graphics.Drawables;
using global::Android.Util;
using global::Android.Views;
using global::Android.Widget;
using CalmInTheRush.Android.Ui;

public sealed class MessageBannerView : TextView
{
    private int showToken;

    public MessageBannerView(Context context)
        : base(context)
    {
        var background = new GradientDrawable();
        background.SetShape(ShapeType.Rectangle);
        background.SetColor(context.ColorOf(Resource.Color.calm_background));
        background.SetCornerRadius(Units.Dp(context, 10));
        background.SetStroke(Units.Dp(context, 1), context.ColorOf(Resource.Color.calm_border));
        Background = background;
        Gravity = GravityFlags.Center;
        var padding = Units.Dp(context, 12);
        SetPaddingRelative(padding, padding, padding, padding);
        SetTextSize(ComplexUnitType.Sp, 14);
        SetTextColor(context.ColorOf(Resource.Color.calm_foreground));
        AccessibilityLiveRegion = AccessibilityLiveRegion.Polite;
        Visibility = ViewStates.Gone;
    }

    public void Show(string message)
    {
        Text = message;
        Visibility = ViewStates.Visible;
        showToken++;
        _ = HideAsync(showToken);
    }

    private async Task HideAsync(int token)
    {
        await Task.Delay(5000).ConfigureAwait(true);
        if (token == showToken)
        {
            Visibility = ViewStates.Gone;
        }
    }
}
