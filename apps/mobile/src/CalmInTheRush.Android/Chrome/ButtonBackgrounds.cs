namespace CalmInTheRush.Android.Chrome;

using global::Android.Content;
using global::Android.Graphics;
using global::Android.Util;
using global::Android.Widget;

/// <summary>Borderless button backgrounds with touch feedback.</summary>
internal static class ButtonBackgrounds
{
    public static void ApplyBorderless(Context context, Button button)
    {
        var theme = context.Theme;
        var value = new TypedValue();
        if (theme is not null
            && theme.ResolveAttribute(global::Android.Resource.Attribute.SelectableItemBackgroundBorderless, value, true)
            && value.ResourceId != 0)
        {
            button.SetBackgroundResource(value.ResourceId);
        }
        else
        {
            button.SetBackgroundColor(Color.Transparent);
        }
    }
}
