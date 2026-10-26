namespace CalmInTheRush.Android.Chrome;

using global::Android.Content;
using global::Android.Graphics;
using global::Android.Graphics.Drawables;
using global::Android.Widget;
using CalmInTheRush.Android.Ui;

public sealed class SoundToggleButton : ImageButton
{
    private readonly Context context;
    private bool soundOn = true;

    public SoundToggleButton(Context context)
        : base(context)
    {
        this.context = context;
        var background = context.ColorOf(Resource.Color.calm_background);
        var oval = new GradientDrawable();
        oval.SetShape(ShapeType.Oval);
        oval.SetColor(Color.Argb(153, background.R, background.G, background.B));
        var inset = Units.Dp(context, 6);
        var layers = new LayerDrawable(new Drawable[] { oval });
        layers.SetLayerInset(0, inset, inset, inset, inset);
        Background = layers;
        var touch = Units.Dp(context, 48);
        SetMinimumWidth(touch);
        SetMinimumHeight(touch);
        SetPaddingRelative(inset, inset, inset, inset);
        SetScaleType(ScaleType.Center);
        UpdateIcon();
    }

    public bool SoundOn
    {
        get => soundOn;
        set
        {
            if (soundOn != value)
            {
                soundOn = value;
                UpdateIcon();
            }
        }
    }

    private void UpdateIcon()
    {
        var id = soundOn ? Resource.Drawable.ic_volume_on : Resource.Drawable.ic_volume_off;
        var icon = DrawableTint.Tinted(context, id, context.ColorOf(Resource.Color.calm_foreground).ToArgb());
        if (icon is not null)
        {
            SetImageDrawable(icon);
        }
        else
        {
            SetImageResource(id);
        }

        ContentDescription = context.GetString(soundOn ? Resource.String.mute_sound : Resource.String.unmute_sound);
    }
}
