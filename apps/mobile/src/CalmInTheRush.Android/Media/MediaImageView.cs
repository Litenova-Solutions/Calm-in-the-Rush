using global::Android.Content;
using global::Android.Graphics;
using global::Android.Util;
using global::Android.Widget;
using CalmInTheRush.Android.Ui;
using CalmInTheRush.Domain.Experiences;

namespace CalmInTheRush.Android.Media;

public sealed class MediaImageView : ImageView
{
    static readonly LruCache cache = new BitmapCache(CacheSize());

    readonly Context context;
    ImageTarget? pending;
    string? loadedKey;
    int generation;

    public MediaImageView(Context context)
        : base(context)
    {
        this.context = context;
        SetScaleType(ImageView.ScaleType.CenterCrop);
        SetBackgroundColor(context.ColorOf(Resource.Color.calm_muted));
    }

    public void SetMedia(ExperienceMedia media, string contentDescription)
    {
        ContentDescription = contentDescription;
        generation++;
        pending = ImageTarget.From(media);
        loadedKey = null;
        if (pending is { } target && Width > 0 && Height > 0)
        {
            Load(target, Width, Height, generation);
        }
    }

    protected override void OnSizeChanged(int w, int h, int oldw, int oldh)
    {
        base.OnSizeChanged(w, h, oldw, oldh);
        if (pending is { } target && w > 0 && h > 0)
        {
            Load(target, w, h, generation);
        }
    }

    protected override void OnDetachedFromWindow()
    {
        generation++;
        pending = null;
        loadedKey = null;
        SetImageDrawable(null);
        base.OnDetachedFromWindow();
    }

    void Load(ImageTarget target, int width, int height, int loadGeneration)
    {
        string requestKey = target.RequestKey(width, height);
        if (requestKey == loadedKey)
        {
            return;
        }

        loadedKey = requestKey;
        Task.Run(() =>
        {
            Bitmap? bitmap = Decode(target, width, height);
            Post(() =>
            {
                if (loadGeneration == generation && bitmap is not null)
                {
                    SetImageBitmap(bitmap);
                }
            });
        });
    }

    Bitmap? Decode(ImageTarget target, int width, int height)
    {
#pragma warning disable CA1031 // A failed decode keeps the muted background; it never crashes the app.
        try
        {
            (int sourceWidth, int sourceHeight) = target.IsAsset ? AssetSize(target.Path) : FileSize(target.Path);
            int sample = SampleSize(sourceWidth, sourceHeight, width, height);
            var key = new Java.Lang.String(target.CacheKey(sample));
            if (cache.Get(key) is Bitmap cached)
            {
                return cached;
            }

            Bitmap? bitmap = target.IsAsset ? DecodeAsset(target.Path, sample) : DecodeFile(target.Path, sample);
            if (bitmap is not null)
            {
                cache.Put(key, bitmap);
            }

            return bitmap;
        }
        catch (Exception)
        {
            return null;
        }
#pragma warning restore CA1031
    }

    (int Width, int Height) AssetSize(string path)
    {
        using Stream stream = context.Assets!.Open(path)!;
        var bounds = new BitmapFactory.Options { InJustDecodeBounds = true };
        BitmapFactory.DecodeStream(stream, null, bounds);
        return (bounds.OutWidth, bounds.OutHeight);
    }

    Bitmap? DecodeAsset(string path, int sample)
    {
        using Stream stream = context.Assets!.Open(path)!;
        return BitmapFactory.DecodeStream(stream, null, new BitmapFactory.Options { InSampleSize = sample });
    }

    static (int Width, int Height) FileSize(string path)
    {
        var bounds = new BitmapFactory.Options { InJustDecodeBounds = true };
        BitmapFactory.DecodeFile(path, bounds);
        return (bounds.OutWidth, bounds.OutHeight);
    }

    static Bitmap? DecodeFile(string path, int sample) =>
        BitmapFactory.DecodeFile(path, new BitmapFactory.Options { InSampleSize = sample });

    static int SampleSize(int sourceWidth, int sourceHeight, int width, int height)
    {
        int sample = 1;
        while (sourceWidth / (sample * 2) >= width && sourceHeight / (sample * 2) >= height)
        {
            sample *= 2;
        }

        return sample;
    }

    static int CacheSize()
    {
        long eighth = Java.Lang.Runtime.GetRuntime()!.MaxMemory() / 1024 / 8;
        return (int)Math.Max(1, eighth);
    }

    sealed record ImageTarget(bool IsAsset, string Path)
    {
        public static ImageTarget? From(ExperienceMedia media) => media switch
        {
            BundledImage image => new ImageTarget(true, image.AssetPath),
            BundledVideo video => new ImageTarget(true, video.PosterAssetPath),
            LocalImage local => new ImageTarget(false, local.StoredPath),
            _ => null,
        };

        public string RequestKey(int width, int height) => Prefix() + Path + "@" + width + "x" + height;

        public string CacheKey(int sample) => Prefix() + Path + "@" + sample;

        string Prefix() => IsAsset ? "asset:" : "file:";
    }

    sealed class BitmapCache(int maxSize) : LruCache(maxSize)
    {
        protected override int SizeOf(Java.Lang.Object? key, Java.Lang.Object? value) =>
            value is Bitmap bitmap ? Math.Max(1, bitmap.ByteCount / 1024) : 1;
    }
}
