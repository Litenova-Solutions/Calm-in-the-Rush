namespace CalmInTheRush.Android.Chrome;

using global::Android.Content;
using global::Android.Graphics.Drawables;

/// <summary>Black vector drawables tinted by the caller.</summary>
internal static class DrawableTint
{
    public static Drawable? Tinted(Context context, int drawableId, int color)
    {
        var drawable = context.GetDrawable(drawableId);
        if (drawable is null)
        {
            return null;
        }

        drawable.Mutate().SetTint(color);
        return drawable;
    }
}
