namespace CalmInTheRush.Android.Screens;

using global::Android.Content;
using global::Android.Graphics;
using global::Android.Graphics.Drawables;
using global::Android.OS;
using global::Android.Text;
using global::Android.Util;
using global::Android.Views;
using global::Android.Widget;
using CalmInTheRush.Android.Chrome;
using CalmInTheRush.Android.Ui;
using CalmInTheRush.Domain.Experiences;

public sealed class GatewayScreenView : FrameLayout
{
    private readonly EditText? draft;
    private readonly Button? clearButton;
    private readonly Button? saveButton;
    private bool saving;

    public GatewayScreenView(Context context, GatewayScreen screen, ExperienceLocale locale, OneLinerSettings? oneLiner, string savedOneLiner)
        : base(context)
    {
        SetBackgroundColor(context.ColorOf(Resource.Color.calm_background));

        var scroll = new ScrollView(context)
        {
            LayoutParameters = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.MatchParent),
        };
        scroll.FillViewport = true;
        AddView(scroll);

        var column = new LinearLayout(context)
        {
            Orientation = Orientation.Vertical,
            LayoutParameters = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.MatchParent),
        };
        column.SetGravity(GravityFlags.Center);
        var side = Units.Dp(context, 20);
        column.SetPaddingRelative(side, Units.Dp(context, 72), side, Units.Dp(context, 96));
        SystemInsets.Track(this, (top, _) => column.SetPaddingRelative(side, Units.Dp(context, 72) + top, side, Units.Dp(context, 96)));
        scroll.AddView(column);

        var showLogo = oneLiner is null;
        if (showLogo)
        {
            var dutch = locale == ExperienceLocale.Dutch;
            var logo = new ImageView(context);
            logo.SetImageResource(dutch ? Resource.Drawable.logo_rust : Resource.Drawable.logo_calm);
            logo.ContentDescription = context.GetString(dutch ? Resource.String.logo_rust_description : Resource.String.logo_calm_description);
            logo.SetAdjustViewBounds(true);
            logo.LayoutParameters = new LinearLayout.LayoutParams(Units.Dp(context, 256), ViewGroup.LayoutParams.WrapContent);
            column.AddView(logo);
        }

        if (screen.Id == "calm-logo")
        {
            ContentDescription = screen.Title;
        }
        else
        {
            var title = new TextView(context)
            {
                Text = screen.Title,
                Gravity = GravityFlags.Center,
            };
            title.SetTextSize(ComplexUnitType.Sp, 24);
            title.SetTextColor(context.ColorOf(Resource.Color.calm_foreground));
            if (OperatingSystem.IsAndroidVersionAtLeast(28))
            {
                title.AccessibilityHeading = true;
            }

            var titleParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WrapContent, ViewGroup.LayoutParams.WrapContent);
            titleParams.TopMargin = showLogo ? Units.Dp(context, 20) : 0;
            title.LayoutParameters = titleParams;
            column.AddView(title);
        }

        if (!string.IsNullOrWhiteSpace(screen.Description))
        {
            var body = new TextView(context)
            {
                Text = screen.Description,
                Gravity = GravityFlags.Center,
            };
            body.SetTextSize(ComplexUnitType.Sp, 14);
            body.SetTextColor(context.ColorOf(Resource.Color.calm_muted_foreground));
            body.SetLineSpacing(0f, 1.625f);
            body.SetMaxWidth(Units.Dp(context, 288));
            var bodyParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WrapContent, ViewGroup.LayoutParams.WrapContent);
            bodyParams.TopMargin = Units.Dp(context, 8);
            body.LayoutParameters = bodyParams;
            column.AddView(body);
        }

        if (screen.Links.Count > 0)
        {
            var links = new LinearLayout(context)
            {
                Orientation = Orientation.Vertical,
            };
            var linksParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent);
            linksParams.TopMargin = Units.Dp(context, 28);
            links.LayoutParameters = linksParams;
            column.AddView(links);

            var first = true;
            foreach (var link in screen.Links)
            {
                var button = OutlinedLinkButton(context, link);
                var buttonParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent);
                buttonParams.TopMargin = first ? 0 : Units.Dp(context, 8);
                button.LayoutParameters = buttonParams;
                button.Click += (sender, e) => LinkOpened?.Invoke(this, link);
                links.AddView(button);
                first = false;
            }
        }

        if (oneLiner is not null)
        {
            var form = new LinearLayout(context)
            {
                Orientation = Orientation.Vertical,
            };
            var formParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent);
            formParams.TopMargin = Units.Dp(context, 28);
            form.LayoutParameters = formParams;
            column.AddView(form);

            var prompt = new TextView(context)
            {
                Text = oneLiner.Prompt,
                LayoutParameters = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent),
            };
            prompt.SetTextSize(ComplexUnitType.Sp, 14);
            prompt.SetTextColor(context.ColorOf(Resource.Color.calm_muted_foreground));
            prompt.SetLineSpacing(0f, 1.625f);
            form.AddView(prompt);

            var background = context.ColorOf(Resource.Color.calm_background);
            var field = new EditText(context);
            field.InputType = InputTypes.ClassText | InputTypes.TextFlagMultiLine;
            field.SetLines(5);
            field.SetFilters(new IInputFilter[] { new InputFilterLengthFilter(Experience.OneLinerMaxLength) });
            field.Hint = oneLiner.Placeholder;
            field.ContentDescription = context.GetString(Resource.String.reflection_label);
            field.SetTextSize(ComplexUnitType.Sp, 16);
            field.SetTextColor(context.ColorOf(Resource.Color.calm_foreground));
            field.SetHintTextColor(context.ColorOf(Resource.Color.calm_muted_foreground));
            field.Gravity = GravityFlags.Top | GravityFlags.Start;
            var fieldBackground = new GradientDrawable();
            fieldBackground.SetShape(ShapeType.Rectangle);
            fieldBackground.SetColor(Color.Argb(102, background.R, background.G, background.B));
            fieldBackground.SetCornerRadius(Units.Dp(context, 10));
            fieldBackground.SetStroke(Units.Dp(context, 1), context.ColorOf(Resource.Color.calm_border));
            field.Background = fieldBackground;
            var fieldPadding = Units.Dp(context, 12);
            field.SetPaddingRelative(fieldPadding, fieldPadding, fieldPadding, fieldPadding);
            field.Text = savedOneLiner;
            var fieldParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent);
            fieldParams.TopMargin = Units.Dp(context, 16);
            field.LayoutParameters = fieldParams;
            form.AddView(field);
            draft = field;

            var row = new LinearLayout(context)
            {
                Orientation = Orientation.Horizontal,
            };
            row.SetGravity(GravityFlags.CenterVertical);
            var rowParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent);
            rowParams.TopMargin = Units.Dp(context, 12);
            row.LayoutParameters = rowParams;
            form.AddView(row);

            var clear = new Button(context)
            {
                Text = context.GetString(Resource.String.clear),
                TransformationMethod = null,
            };
            clear.SetTextSize(ComplexUnitType.Sp, 14);
            clear.SetTextColor(context.ColorOf(Resource.Color.calm_primary));
            ButtonBackgrounds.ApplyBorderless(context, clear);
            clear.SetMinimumHeight(Units.Dp(context, 48));
            clear.Click += (sender, e) =>
            {
                if (draft is not null)
                {
                    draft.Text = string.Empty;
                }

                OneLinerClearRequested?.Invoke(this, EventArgs.Empty);
            };
            clear.Visibility = string.IsNullOrEmpty(savedOneLiner) ? ViewStates.Gone : ViewStates.Visible;
            row.AddView(clear);
            clearButton = clear;

            var spacer = new View(context)
            {
                LayoutParameters = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WrapContent, 1f),
            };
            row.AddView(spacer);

            var save = new Button(context)
            {
                Text = context.GetString(Resource.String.save),
                TransformationMethod = null,
            };
            save.SetTextSize(ComplexUnitType.Sp, 14);
            save.SetTextColor(context.ColorOf(Resource.Color.calm_primary_foreground));
            save.Background = SaveBackground(context);
            save.SetMinimumHeight(Units.Dp(context, 48));
            save.SetMinimumWidth(Units.Dp(context, 48));
            save.Click += (sender, e) => OneLinerSaveRequested?.Invoke(this, draft?.Text?.Trim() ?? string.Empty);
            row.AddView(save);
            saveButton = save;

            field.TextChanged += (sender, e) => UpdateSaveEnabled();
            UpdateSaveEnabled();
        }
    }

    public event EventHandler<string>? OneLinerSaveRequested;

    public event EventHandler? OneLinerClearRequested;

    public event EventHandler<ExternalLink>? LinkOpened;

    public void SetSaving(bool saving)
    {
        this.saving = saving;
        if (clearButton is not null)
        {
            clearButton.Enabled = !saving;
        }

        UpdateSaveEnabled();
    }

    public void ShowSavedOneLiner(string value)
    {
        if (draft is not null)
        {
            draft.Text = value;
        }

        if (clearButton is not null)
        {
            clearButton.Visibility = string.IsNullOrEmpty(value) ? ViewStates.Gone : ViewStates.Visible;
        }

        UpdateSaveEnabled();
    }

    private static Button OutlinedLinkButton(Context context, ExternalLink link)
    {
        var button = new Button(context)
        {
            Text = link.Label,
            TransformationMethod = null,
        };
        button.SetTextSize(ComplexUnitType.Sp, 14);
        button.SetTextColor(context.ColorOf(Resource.Color.calm_foreground));
        var outline = new GradientDrawable();
        outline.SetShape(ShapeType.Rectangle);
        outline.SetColor(Color.Transparent);
        outline.SetCornerRadius(Units.Dp(context, 10));
        outline.SetStroke(Units.Dp(context, 1), context.ColorOf(Resource.Color.calm_border));
        button.Background = outline;
        button.SetMinimumHeight(Units.Dp(context, 48));
        return button;
    }

    private static StateListDrawable SaveBackground(Context context)
    {
        var primary = context.ColorOf(Resource.Color.calm_primary);
        var enabled = new GradientDrawable();
        enabled.SetShape(ShapeType.Rectangle);
        enabled.SetColor(primary);
        enabled.SetCornerRadius(Units.Dp(context, 10));
        var disabled = new GradientDrawable();
        disabled.SetShape(ShapeType.Rectangle);
        disabled.SetColor(Color.Argb(128, primary.R, primary.G, primary.B));
        disabled.SetCornerRadius(Units.Dp(context, 10));
        var states = new StateListDrawable();
        states.AddState(new int[] { -global::Android.Resource.Attribute.StateEnabled }, disabled);
        states.AddState(Array.Empty<int>(), enabled);
        return states;
    }

    private void UpdateSaveEnabled()
    {
        if (saveButton is null || draft is null)
        {
            return;
        }

        saveButton.Enabled = !saving && draft.Text?.Trim().Length > 0;
    }
}
