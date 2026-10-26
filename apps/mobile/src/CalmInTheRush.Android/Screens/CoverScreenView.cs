using global::Android.Content;
using global::Android.Graphics;
using global::Android.Graphics.Drawables;
using global::Android.Util;
using global::Android.Views;
using global::Android.Widget;
using CalmInTheRush.Android.Media;
using CalmInTheRush.Android.Motion;
using CalmInTheRush.Android.Ui;
using CalmInTheRush.Domain.Experiences;
using JavaObject = Java.Lang.Object;

namespace CalmInTheRush.Android.Screens;

public sealed class CoverScreenView : FrameLayout
{
    public CoverScreenView(Context context, GalleryScreen screen, PrefilledTile cover)
        : base(context)
    {
        SetBackgroundColor(context.ColorOf(Resource.Color.calm_stage));
        ContentDescription = screen.Title;

        View visual = cover.Media is BundledVideo video
            ? CreateVideo(context, video, cover.Alt)
            : CreateImage(context, cover.Media, cover.Alt);
        visual.LayoutParameters = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MatchParent,
            ViewGroup.LayoutParams.MatchParent);
        AddView(visual);

        AddView(new View(context)
        {
            Background = CreateScrim(context),
            LayoutParameters = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MatchParent,
                ViewGroup.LayoutParams.MatchParent),
        });

        if (!string.IsNullOrEmpty(cover.Sentence))
        {
            var sentence = new DriftingSentenceView(context)
            {
                Text = cover.Sentence,
            };
            sentence.SetTextSize(ComplexUnitType.Sp, 16);
            sentence.SetTextColor(WithAlpha(context.ColorOf(Resource.Color.calm_stage_foreground), 0.85));
            sentence.SetTypeface(Typeface.Default, TypefaceStyle.Normal);
            sentence.SetMaxWidth(Units.Dp(context, 256));
            int baseTop = Units.Dp(context, 48);
            var sentenceParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WrapContent,
                ViewGroup.LayoutParams.WrapContent,
                GravityFlags.Top | GravityFlags.Start)
            {
                TopMargin = baseTop,
            };
            sentenceParams.MarginStart = Units.Dp(context, 20);
            sentence.LayoutParameters = sentenceParams;
            AddView(sentence);
            SetOnApplyWindowInsetsListener(new TopInsetListener(top =>
            {
                sentenceParams.TopMargin = baseTop + top;
                sentence.LayoutParameters = sentenceParams;
            }));
        }
    }

    private static MediaImageView CreateImage(Context context, ExperienceMedia media, string description)
    {
        var image = new MediaImageView(context);
        image.SetMedia(media, description);
        return image;
    }

    private static LoopingVideoView CreateVideo(Context context, BundledVideo video, string description)
    {
        var player = new LoopingVideoView(context);
        player.SetVideo(video, description);
        return player;
    }

    private static GradientDrawable CreateScrim(Context context)
    {
        Color scrim = context.ColorOf(Resource.Color.calm_scrim);
        return new GradientDrawable(
            GradientDrawable.Orientation.TopBottom,
            new[]
            {
                WithAlpha(scrim, 0.4).ToArgb(),
                Color.Transparent.ToArgb(),
                WithAlpha(scrim, 0.7).ToArgb(),
            });
    }

    private static Color WithAlpha(Color color, double fraction) =>
        Color.Argb((int)Math.Round(byte.MaxValue * fraction), color.R, color.G, color.B);

    private sealed class TopInsetListener(Action<int> onTopInset) : JavaObject, View.IOnApplyWindowInsetsListener
    {
        public WindowInsets OnApplyWindowInsets(View _, WindowInsets insets)
        {
            int top;
            if (OperatingSystem.IsAndroidVersionAtLeast(30))
            {
                top = insets.GetInsets(WindowInsets.Type.SystemBars()).Top;
            }
            else
            {
#pragma warning disable CS0618, CA1422 // Deprecated pre-30 inset getter; guarded fallback.
                top = insets.SystemWindowInsetTop;
#pragma warning restore CS0618, CA1422
            }

            onTopInset(top);
            return insets;
        }
    }
}
