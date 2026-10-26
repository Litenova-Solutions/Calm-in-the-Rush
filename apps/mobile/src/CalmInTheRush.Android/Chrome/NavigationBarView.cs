namespace CalmInTheRush.Android.Chrome;

using global::Android.Content;
using global::Android.Graphics;
using global::Android.Util;
using global::Android.Views;
using global::Android.Widget;
using CalmInTheRush.Android.Ui;
using System.Globalization;

public sealed class NavigationBarView : LinearLayout
{
    private readonly Context context;
    private readonly Button backButton;
    private readonly TextView pageLabel;
    private readonly Button nextButton;
    private readonly View seeMoreSpacer;
    private readonly Button seeMoreButton;

    public NavigationBarView(Context context)
        : base(context)
    {
        this.context = context;
        Orientation = Orientation.Vertical;
        SetBackgroundColor(context.ColorOf(Resource.Color.calm_chrome));
        ContentDescription = context.GetString(Resource.String.navigation_label);

        var border = context.ColorOf(Resource.Color.calm_border);
        var divider = new View(context)
        {
            LayoutParameters = new LayoutParams(ViewGroup.LayoutParams.MatchParent, Units.Dp(context, 1)),
        };
        divider.SetBackgroundColor(Color.Argb(64, border.R, border.G, border.B));
        AddView(divider);

        var row = new LinearLayout(context)
        {
            Orientation = Orientation.Horizontal,
            LayoutParameters = new LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent),
        };
        row.SetGravity(GravityFlags.CenterVertical);
        var side = Units.Dp(context, 16);
        var vertical = Units.Dp(context, 12);
        row.SetPaddingRelative(side, vertical, side, vertical);
        SystemInsets.Track(this, (_, bottom) => row.SetPaddingRelative(side, vertical, side, vertical + bottom));
        AddView(row);

        backButton = GhostButton(context, context.GetString(Resource.String.back), Resource.Drawable.ic_chevron_left, iconAtStart: true);
        backButton.Click += (sender, e) => BackClicked?.Invoke(this, EventArgs.Empty);
        row.AddView(backButton);

        pageLabel = new TextView(context)
        {
            Gravity = GravityFlags.Center,
            LayoutParameters = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WrapContent, 1f),
        };
        pageLabel.SetTextSize(ComplexUnitType.Sp, 12);
        pageLabel.SetTextColor(context.ColorOf(Resource.Color.calm_muted_foreground));
        pageLabel.AccessibilityLiveRegion = AccessibilityLiveRegion.Polite;
        row.AddView(pageLabel);

        nextButton = GhostButton(context, context.GetString(Resource.String.next), Resource.Drawable.ic_chevron_right, iconAtStart: false);
        nextButton.Click += (sender, e) => NextClicked?.Invoke(this, EventArgs.Empty);
        row.AddView(nextButton);

        seeMoreSpacer = new View(context)
        {
            LayoutParameters = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WrapContent, 1f),
        };
        row.AddView(seeMoreSpacer);

        seeMoreButton = GhostButton(context, context.GetString(Resource.String.see_more), Resource.Drawable.ic_chevron_right, iconAtStart: false);
        seeMoreButton.Click += (sender, e) => SeeMoreClicked?.Invoke(this, EventArgs.Empty);
        row.AddView(seeMoreButton);

        ShowSeeMore();
    }

    public event EventHandler? BackClicked;

    public event EventHandler? NextClicked;

    public event EventHandler? SeeMoreClicked;

    public void ShowPaging(int current, int total, bool hasPrevious, bool hasNext)
    {
        backButton.Visibility = ViewStates.Visible;
        pageLabel.Visibility = ViewStates.Visible;
        nextButton.Visibility = ViewStates.Visible;
        seeMoreSpacer.Visibility = ViewStates.Gone;
        seeMoreButton.Visibility = ViewStates.Gone;
        pageLabel.Text = string.Format(CultureInfo.InvariantCulture, context.GetString(Resource.String.page_of), current, total);
        backButton.Enabled = hasPrevious;
        backButton.Alpha = hasPrevious ? 1f : 0.5f;
        nextButton.Enabled = hasNext;
        nextButton.Alpha = hasNext ? 1f : 0.5f;
    }

    public void ShowSeeMore()
    {
        backButton.Visibility = ViewStates.Gone;
        pageLabel.Visibility = ViewStates.Gone;
        nextButton.Visibility = ViewStates.Gone;
        seeMoreSpacer.Visibility = ViewStates.Visible;
        seeMoreButton.Visibility = ViewStates.Visible;
    }

    private static Button GhostButton(Context context, string text, int iconId, bool iconAtStart)
    {
        var button = new Button(context)
        {
            Text = text,
            TransformationMethod = null,
        };
        button.SetTextSize(ComplexUnitType.Sp, 14);
        var foreground = context.ColorOf(Resource.Color.calm_foreground);
        button.SetTextColor(foreground);
        ButtonBackgrounds.ApplyBorderless(context, button);
        button.CompoundDrawablePadding = Units.Dp(context, 4);
        if (iconAtStart)
        {
            button.SetCompoundDrawablesRelativeWithIntrinsicBounds(iconId, 0, 0, 0);
        }
        else
        {
            button.SetCompoundDrawablesRelativeWithIntrinsicBounds(0, 0, iconId, 0);
        }

        foreach (var drawable in button.GetCompoundDrawablesRelative())
        {
            drawable?.Mutate().SetTint(foreground.ToArgb());
        }

        button.SetMinimumHeight(Units.Dp(context, 48));
        button.SetMinimumWidth(Units.Dp(context, 48));
        return button;
    }
}
