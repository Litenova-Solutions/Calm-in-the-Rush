namespace CalmInTheRush.Android.Ui;

using global::Android.Content;
using global::Android.Graphics;

/// <summary>Reads a color resource as a <see cref="Color"/>; the binding returns the packed ARGB value.</summary>
public static class ColorResources
{
    public static Color ColorOf(this Context context, int colorResource) => new(context.GetColor(colorResource));
}
