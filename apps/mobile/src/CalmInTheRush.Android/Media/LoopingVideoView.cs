using global::Android.Content;
using global::Android.Graphics;
using global::Android.Media;
using global::Android.Views;
using global::Android.Widget;
using CalmInTheRush.Android.Ui;
using CalmInTheRush.Domain.Experiences;

namespace CalmInTheRush.Android.Media;

public sealed class LoopingVideoView : FrameLayout
{
    readonly Context context;
    readonly MediaImageView poster;
    readonly TextureView surface;
    BundledVideo? source;
    MediaPlayer? player;
    bool prepared;
    bool paused;
    int videoWidth;
    int videoHeight;

    public LoopingVideoView(Context context)
        : base(context)
    {
        this.context = context;
        poster = new MediaImageView(context)
        {
            LayoutParameters = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MatchParent,
                ViewGroup.LayoutParams.MatchParent),
        };
        surface = new TextureView(context)
        {
            LayoutParameters = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MatchParent,
                ViewGroup.LayoutParams.MatchParent),
        };
        surface.SurfaceTextureListener = new SurfaceListener(this);
        AddView(poster);
        AddView(surface);
    }

    public void SetVideo(BundledVideo video, string contentDescription)
    {
        ContentDescription = contentDescription;
        source = video;
        poster.Visibility = ViewStates.Visible;
        poster.SetMedia(video, contentDescription);
        ReleasePlayer();
        surface.Visibility = MotionPreference.IsReduced(context) ? ViewStates.Gone : ViewStates.Visible;
        if (surface.Visibility == ViewStates.Visible && surface.IsAvailable)
        {
            CreatePlayer();
        }
    }

    public void Pause()
    {
        paused = true;
        if (player?.IsPlaying == true)
        {
            player.Pause();
        }
    }

    public void Resume()
    {
        paused = false;
        if (player is not null && prepared)
        {
            player.Start();
        }
    }

    protected override void OnSizeChanged(int w, int h, int oldw, int oldh)
    {
        base.OnSizeChanged(w, h, oldw, oldh);
        ApplyCrop();
    }

    protected override void OnWindowVisibilityChanged(ViewStates visibility)
    {
        base.OnWindowVisibilityChanged(visibility);
        if (visibility == ViewStates.Visible)
        {
            Resume();
        }
        else
        {
            Pause();
        }
    }

    protected override void OnDetachedFromWindow()
    {
        ReleasePlayer();
        base.OnDetachedFromWindow();
    }

    void OnSurfaceAvailable()
    {
        if (source is null || MotionPreference.IsReduced(context))
        {
            return;
        }

        CreatePlayer();
    }

    void CreatePlayer()
    {
        if (source is null || surface.SurfaceTexture is not { } texture)
        {
            return;
        }

        ReleasePlayer();
        var created = new MediaPlayer();
        try
        {
            created.SetAudioAttributes(new AudioAttributes.Builder()
                .SetUsage(AudioUsageKind.Media)!
                .SetContentType(AudioContentType.Music)!
                .Build()!);
            using var asset = context.Assets!.OpenFd(source.AssetPath);
            if (asset?.FileDescriptor is null)
            {
                created.Release();
                created.Dispose();
                return;
            }

            // The player duplicates the descriptor, so the asset entry can close here.
            created.SetDataSource(asset.FileDescriptor, asset.StartOffset, asset.Length);
            created.SetSurface(new Surface(texture));
            created.SetVolume(0, 0);
            created.Looping = true;
            created.SetOnPreparedListener(new PreparedListener(this, created));
            created.SetOnInfoListener(new FirstFrameListener(this, created));
            created.PrepareAsync();
            player = created;
        }
        catch (Java.Lang.Exception)
        {
            // Without a player the poster stays visible.
            created.Release();
            created.Dispose();
        }
    }

    void OnPrepared(MediaPlayer finished)
    {
        if (!ReferenceEquals(finished, player))
        {
            finished.Release();
            finished.Dispose();
            return;
        }

        prepared = true;
        videoWidth = finished.VideoWidth;
        videoHeight = finished.VideoHeight;
        ApplyCrop();
        if (!paused)
        {
            finished.Start();
        }
    }

    void OnFirstFrame(MediaPlayer finished, MediaInfo what)
    {
        if (ReferenceEquals(finished, player) && what == MediaInfo.VideoRenderingStart)
        {
            poster.Visibility = ViewStates.Gone;
        }
    }

    void ApplyCrop()
    {
        if (videoWidth <= 0 || videoHeight <= 0 || surface.Width <= 0 || surface.Height <= 0)
        {
            return;
        }

        // The texture already stretches the frame to the view; scale it back to the video's
        // aspect ratio and up until it covers the view, around the view's center.
        float scale = Math.Max((float)surface.Width / videoWidth, (float)surface.Height / videoHeight);
        var crop = new Matrix();
        crop.SetScale(
            videoWidth * scale / surface.Width,
            videoHeight * scale / surface.Height,
            surface.Width / 2f,
            surface.Height / 2f);
        surface.SetTransform(crop);
    }

    void ReleasePlayer()
    {
        if (player is { } current)
        {
            player = null;
            prepared = false;
            poster.Visibility = ViewStates.Visible;
            videoWidth = 0;
            videoHeight = 0;
            current.Release();
            current.Dispose();
        }
    }

    sealed class SurfaceListener(LoopingVideoView owner) : Java.Lang.Object, TextureView.ISurfaceTextureListener
    {
        public void OnSurfaceTextureAvailable(SurfaceTexture? surface, int width, int height) => owner.OnSurfaceAvailable();

        public void OnSurfaceTextureSizeChanged(SurfaceTexture? surface, int width, int height) => owner.ApplyCrop();

        public bool OnSurfaceTextureDestroyed(SurfaceTexture? surface)
        {
            owner.ReleasePlayer();
            return true;
        }

        public void OnSurfaceTextureUpdated(SurfaceTexture? surface)
        {
        }
    }

    sealed class PreparedListener(LoopingVideoView owner, MediaPlayer created) : Java.Lang.Object, MediaPlayer.IOnPreparedListener
    {
        public void OnPrepared(MediaPlayer? mp) => owner.OnPrepared(created);
    }

    sealed class FirstFrameListener(LoopingVideoView owner, MediaPlayer created) : Java.Lang.Object, MediaPlayer.IOnInfoListener
    {
        public bool OnInfo(MediaPlayer? mp, MediaInfo what, int extra)
        {
            owner.OnFirstFrame(created, what);
            return true;
        }
    }
}
