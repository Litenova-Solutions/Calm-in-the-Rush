namespace CalmInTheRush.Android.Flow;

using global::Android.OS;
using global::Android.Views;

/// <summary>Draws the app edge to edge and picks status bar icons that stay readable over the current screen.</summary>
static class SystemBars
{
    public static void DrawEdgeToEdge(Activity activity)
    {
        var window = activity.Window!;
        if (OperatingSystem.IsAndroidVersionAtLeast(35))
        {
            return; // Apps targeting API 35 and later always draw edge to edge.
        }

        if (OperatingSystem.IsAndroidVersionAtLeast(30))
        {
            window.SetDecorFitsSystemWindows(false);
            return;
        }

#pragma warning disable CA1422, CS0618 // The flags are the only edge-to-edge switch below API 30.
        window.DecorView.SystemUiVisibility = (StatusBarVisibility)(SystemUiFlags.LayoutStable | SystemUiFlags.LayoutFullscreen | SystemUiFlags.LayoutHideNavigation);
#pragma warning restore CA1422, CS0618
    }

    /// <summary>Light icons over dark active media, dark icons over the light screens.</summary>
    public static void UseLightIcons(Activity activity, bool light)
    {
        var window = activity.Window!;
        if (OperatingSystem.IsAndroidVersionAtLeast(30))
        {
            var appearance = (int)(WindowInsetsControllerAppearance.LightStatusBars | WindowInsetsControllerAppearance.LightNavigationBars);
            window.InsetsController?.SetSystemBarsAppearance(light ? 0 : appearance, appearance);
            return;
        }

#pragma warning disable CA1422, CS0618 // The flags are the only icon color switch below API 30.
        var flags = (SystemUiFlags)window.DecorView.SystemUiVisibility;
        var darkIcons = SystemUiFlags.LightStatusBar | SystemUiFlags.LightNavigationBar;
        flags = light ? flags & ~darkIcons : flags | darkIcons;
        window.DecorView.SystemUiVisibility = (StatusBarVisibility)flags;
#pragma warning restore CA1422, CS0618
    }
}
