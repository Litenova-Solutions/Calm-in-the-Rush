namespace CalmInTheRush.Android.Ui;

using global::Android.Views;

/// <summary>Reads the system bar and cutout insets and hands them to a view as they change.</summary>
public static class SystemInsets
{
    /// <summary>The top and bottom insets in pixels.</summary>
    public static (int Top, int Bottom) Read(WindowInsets insets)
    {
        if (OperatingSystem.IsAndroidVersionAtLeast(30))
        {
            var bars = insets.GetInsets(WindowInsets.Type.SystemBars() | WindowInsets.Type.DisplayCutout());
            return (bars.Top, bars.Bottom);
        }

#pragma warning disable CA1422, CS0618 // The system window insets are the only inset source below API 30.
        return (insets.SystemWindowInsetTop, insets.SystemWindowInsetBottom);
#pragma warning restore CA1422, CS0618
    }

    /// <summary>Calls <paramref name="apply"/> with the top and bottom insets each time the window dispatches them.</summary>
    public static void Track(View view, Action<int, int> apply) =>
        view.SetOnApplyWindowInsetsListener(new Listener(apply));

    sealed class Listener(Action<int, int> apply) : Java.Lang.Object, View.IOnApplyWindowInsetsListener
    {
        public WindowInsets OnApplyWindowInsets(View view, WindowInsets insets)
        {
            var (top, bottom) = Read(insets);
            apply(top, bottom);
            return view.OnApplyWindowInsets(insets) ?? insets;
        }
    }
}
