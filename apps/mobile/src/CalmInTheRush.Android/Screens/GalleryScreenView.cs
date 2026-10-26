using global::Android.Content;
using global::Android.Content.Res;
using global::Android.Graphics;
using global::Android.Graphics.Drawables;
using global::Android.Util;
using global::Android.Views;
using global::Android.Widget;
using CalmInTheRush.Android.Media;
using CalmInTheRush.Android.Ui;
using CalmInTheRush.Domain.Experiences;
using CalmInTheRush.Domain.Visitors;
using JavaObject = Java.Lang.Object;

namespace CalmInTheRush.Android.Screens;

public sealed class GalleryScreenView : FrameLayout
{
    private const string FriendlyFacesScreenId = "friendly-faces";

    public event EventHandler<TileEventArgs>? TileOpened;

    public event EventHandler<TileEventArgs>? UploadRequested;

    public event EventHandler<TileEventArgs>? RemoveRequested;

    public GalleryScreenView(
        Context context,
        GalleryScreen screen,
        IReadOnlyList<ExperienceTile> tiles,
        VisitorState visitor)
        : base(context)
    {
        SetBackgroundColor(context.ColorOf(Resource.Color.calm_background));

        if (tiles.Count == 0)
        {
            AddView(CreateEmptyLabel(context));
        }
        else
        {
            AddView(CreateGrid(context, screen, tiles, visitor));
        }

        var pill = CreateTitlePill(context, screen.Title);
        AddView(pill);
        int pillBaseTop = Units.Dp(context, 48);
        SetOnApplyWindowInsetsListener(new TopInsetListener(top =>
        {
            if (pill.LayoutParameters is FrameLayout.LayoutParams pillParams)
            {
                pillParams.TopMargin = pillBaseTop + top;
                pill.LayoutParameters = pillParams;
            }
        }));
    }

    private LinearLayout CreateGrid(
        Context context,
        GalleryScreen screen,
        IReadOnlyList<ExperienceTile> tiles,
        VisitorState visitor)
    {
        var grid = new LinearLayout(context)
        {
            Orientation = global::Android.Widget.Orientation.Vertical,
            LayoutParameters = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MatchParent,
                ViewGroup.LayoutParams.MatchParent),
            ContentDescription = context.GetString(Resource.String.gallery_photos, new Java.Lang.String(screen.Title)) ?? screen.Title,
        };

        for (int rowStart = 0; rowStart < tiles.Count; rowStart += 2)
        {
            var row = new LinearLayout(context)
            {
                Orientation = global::Android.Widget.Orientation.Horizontal,
                LayoutParameters = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MatchParent, 0, 1f),
            };
            grid.AddView(row);
            AddTileCell(context, screen, tiles[rowStart], rowStart, visitor, row);
            if (rowStart + 1 < tiles.Count)
            {
                AddTileCell(context, screen, tiles[rowStart + 1], rowStart + 1, visitor, row);
            }
            else
            {
                row.AddView(new View(context)
                {
                    LayoutParameters = new LinearLayout.LayoutParams(
                        0, ViewGroup.LayoutParams.MatchParent, 1f),
                });
            }
        }

        return grid;
    }

    private void AddTileCell(
        Context context,
        GalleryScreen screen,
        ExperienceTile tile,
        int tileIndex,
        VisitorState visitor,
        LinearLayout row)
    {
        if (tile is UploadTile slot)
        {
            VisitorUpload? upload = visitor.UploadFor(screen.Id, tile.Id);
            if (upload is null)
            {
                row.AddView(CreateUploadCell(context, screen, slot, tileIndex));
                return;
            }

            AddFilledCell(context, screen, tile, upload.Media, upload.Media.FileName, slot.Label, row);
            return;
        }

        if (tile is PrefilledTile filled)
        {
            AddFilledCell(context, screen, tile, filled.Media, filled.Alt, filled.Title, row);
        }
    }

    private void AddFilledCell(
        Context context,
        GalleryScreen screen,
        ExperienceTile tile,
        ExperienceMedia media,
        string alt,
        string name,
        LinearLayout row)
    {
        var cell = new FrameLayout(context)
        {
            LayoutParameters = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MatchParent, 1f),
            ContentDescription = context.GetString(Resource.String.open_tile, new Java.Lang.String(name)) ?? name,
            Clickable = true,
            Focusable = true,

        };
        cell.Click += (_, _) => TileOpened?.Invoke(this, new TileEventArgs(screen.Id, tile.Id));

        View visual = media is BundledVideo video
            ? CreateVideo(context, video, alt)
            : CreateImage(context, media, alt);
        visual.LayoutParameters = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MatchParent,
            ViewGroup.LayoutParams.MatchParent);
        cell.AddView(visual);

        if (tile is UploadTile filledSlot)
        {
            cell.AddView(CreateRemoveButton(context, screen.Id, tile.Id, filledSlot.Label));
        }

        row.AddView(cell);
    }

    private FrameLayout CreateUploadCell(Context context, GalleryScreen screen, UploadTile tile, int tileIndex)
    {
        var cell = new FrameLayout(context)
        {
            LayoutParameters = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MatchParent, 1f),
            ContentDescription = tile.Label,
            Clickable = true,
            Focusable = true,

        };
        cell.SetBackgroundColor(WithAlpha(context.ColorOf(Resource.Color.calm_muted), 0.7));
        cell.Click += (_, _) => UploadRequested?.Invoke(this, new TileEventArgs(screen.Id, tile.Id));

        bool facesTop = screen.Id == FriendlyFacesScreenId;
        var column = new LinearLayout(context)
        {
            Orientation = global::Android.Widget.Orientation.Vertical,
        };
        var columnParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WrapContent,
            ViewGroup.LayoutParams.WrapContent,
            facesTop
                ? GravityFlags.Top | GravityFlags.CenterHorizontal
                : GravityFlags.Center);
        if (facesTop)
        {
            columnParams.TopMargin = Units.Dp(context, 56);
        }

        column.LayoutParameters = columnParams;
        int side = Units.Dp(context, 16);
        column.SetPadding(side, 0, side, 0);

        if (facesTop)
        {
            column.AddView(CreateFacePlaceholder(context, tileIndex));
        }
        else
        {
            var camera = new ImageView(context)
            {
            };
            camera.SetScaleType(ImageView.ScaleType.FitCenter);
            camera.SetImageResource(Resource.Drawable.ic_camera);
            camera.ImageTintList = ColorStateList.ValueOf(context.ColorOf(Resource.Color.calm_muted_foreground));
            int icon = Units.Dp(context, 20);
            camera.LayoutParameters = new LinearLayout.LayoutParams(icon, icon)
            {
                Gravity = GravityFlags.CenterHorizontal,
            };
            column.AddView(camera);
        }

        column.AddView(CreateCenteredLabel(context, tile.Label, 14, context.ColorOf(Resource.Color.calm_foreground)));
        if (!string.IsNullOrEmpty(tile.Sentence))
        {
            column.AddView(CreateCenteredLabel(
                context, tile.Sentence, 12, context.ColorOf(Resource.Color.calm_muted_foreground)));
        }

        column.AddView(CreateCenteredLabel(
            context,
            context.GetString(Resource.String.upload_hint) ?? string.Empty,
            12,
            WithAlpha(context.ColorOf(Resource.Color.calm_muted_foreground), 0.7)));

        cell.AddView(column);
        return cell;
    }

    private FrameLayout CreateRemoveButton(Context context, string screenId, string tileId, string label)
    {
        int touch = Units.Dp(context, 48);
        var button = new FrameLayout(context)
        {
            LayoutParameters = new FrameLayout.LayoutParams(touch, touch, GravityFlags.Top | GravityFlags.Start),
            ContentDescription = context.GetString(Resource.String.remove_tile, new Java.Lang.String(label)) ?? label,
            Clickable = true,
            Focusable = true,
        };
        button.Click += (_, _) => RemoveRequested?.Invoke(this, new TileEventArgs(screenId, tileId));

        var circle = new GradientDrawable();
        circle.SetShape(ShapeType.Oval);
        circle.SetColor(WithAlpha(context.ColorOf(Resource.Color.calm_background), 0.7));

        var icon = new ImageView(context)
        {
            Background = circle,
        };
        icon.SetScaleType(ImageView.ScaleType.FitCenter);
        icon.SetImageResource(Resource.Drawable.ic_trash);
        icon.ImageTintList = ColorStateList.ValueOf(context.ColorOf(Resource.Color.calm_foreground));
        int inset = Units.Dp(context, 8);
        icon.SetPadding(inset, inset, inset, inset);
        int visual = Units.Dp(context, 32);
        icon.LayoutParameters = new FrameLayout.LayoutParams(visual, visual, GravityFlags.Center);
        button.AddView(icon);
        return button;
    }

    private static TextView CreateTitlePill(Context context, string title)
    {
        var pill = new TextView(context)
        {
            Text = title,
            Gravity = GravityFlags.Center,
            Clickable = false,
            Focusable = false,
        };
        pill.SetTextSize(ComplexUnitType.Sp, 12);
        pill.SetTextColor(context.ColorOf(Resource.Color.calm_muted_foreground));

        var background = new GradientDrawable();
        background.SetShape(ShapeType.Rectangle);
        background.SetColor(context.ColorOf(Resource.Color.calm_chip));
        background.SetStroke(
            Units.Dp(context, 1),
            WithAlpha(context.ColorOf(Resource.Color.calm_border), 0.4));
        background.SetCornerRadius(Units.Dp(context, 999));
        pill.Background = background;

        pill.SetPadding(
            Units.Dp(context, 12),
            Units.Dp(context, 4),
            Units.Dp(context, 12),
            Units.Dp(context, 4));

        var pillParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WrapContent,
            ViewGroup.LayoutParams.WrapContent,
            GravityFlags.Top | GravityFlags.CenterHorizontal)
        {
            TopMargin = Units.Dp(context, 48),
        };
        pillParams.MarginStart = Units.Dp(context, 20);
        pillParams.MarginEnd = Units.Dp(context, 20);
        pill.LayoutParameters = pillParams;
        return pill;
    }

    private static TextView CreateEmptyLabel(Context context)
    {
        var empty = new TextView(context)
        {
            Gravity = GravityFlags.Center,
            LayoutParameters = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WrapContent,
                ViewGroup.LayoutParams.WrapContent,
                GravityFlags.Center),
        };
        empty.Text = context.GetString(Resource.String.no_photos) ?? string.Empty;
        empty.SetTextSize(ComplexUnitType.Sp, 14);
        empty.SetTextColor(context.ColorOf(Resource.Color.calm_muted_foreground));
        return empty;
    }

    private static TextView CreateCenteredLabel(Context context, string text, float textSizeSp, Color color)
    {
        var label = new TextView(context)
        {
            Text = text,
            Gravity = GravityFlags.Center,
        };
        label.SetTextSize(ComplexUnitType.Sp, textSizeSp);
        label.SetTextColor(color);
        label.LayoutParameters = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WrapContent,
            ViewGroup.LayoutParams.WrapContent)
        {
            Gravity = GravityFlags.CenterHorizontal,
            TopMargin = Units.Dp(context, 8),
        };
        return label;
    }

    private static FrameLayout CreateFacePlaceholder(Context context, int tileIndex)
    {
        var circle = new GradientDrawable();
        circle.SetShape(ShapeType.Oval);
        circle.SetColor(WithAlpha(context.ColorOf(Resource.Color.calm_muted), 0.5));

        int size = Units.Dp(context, 128);
        var holder = new FrameLayout(context)
        {
            Background = circle,
            LayoutParameters = new LinearLayout.LayoutParams(size, size)
            {
                Gravity = GravityFlags.CenterHorizontal,
            },
        };
        int code = tileIndex % 4 == 3 ? 0x1F60C : 0x1F600;
        var face = new TextView(context)
        {
            Text = char.ConvertFromUtf32(code),
            Gravity = GravityFlags.Center,
            LayoutParameters = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WrapContent,
                ViewGroup.LayoutParams.WrapContent,
                GravityFlags.Center),
        };
        face.SetTextSize(ComplexUnitType.Sp, 64);
        holder.AddView(face);
        return holder;
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
