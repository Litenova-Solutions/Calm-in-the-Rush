using global::Android.Content;
using global::Android.Media;

namespace CalmInTheRush.Android.Media;

#pragma warning disable CA2213 // The player and the focus request release through ReleasePlayer on every stop path and Dispose.
public sealed class AmbientSound : IDisposable
{
    readonly Context context;
    readonly FocusChangeListener focusListener;
    MediaPlayer? player;
    AudioFocusRequestClass? focusRequest;
    string? path;
    bool enabled = true;
    bool activityPaused;
    bool prepared;
    bool hasFocus;
    bool disposed;

    public AmbientSound(Context context)
    {
        this.context = context.ApplicationContext ?? context;
        focusListener = new FocusChangeListener(this);
    }

    public bool Enabled
    {
        get => enabled;
        set
        {
            if (enabled != value)
            {
                enabled = value;
                UpdatePlayback();
            }
        }
    }

    public void Play(string? audioAssetPath)
    {
        if (disposed || audioAssetPath == path)
        {
            UpdatePlayback();
            return;
        }

        path = audioAssetPath;
        ReleasePlayer();
        UpdatePlayback();
    }

    public void Pause()
    {
        activityPaused = true;
        UpdatePlayback();
    }

    public void Resume()
    {
        activityPaused = false;
        UpdatePlayback();
    }

    public void Dispose()
    {
        disposed = true;
        ReleasePlayer();
        focusListener.Dispose();
    }

    void UpdatePlayback()
    {
        if (disposed || path is null || !enabled || activityPaused)
        {
            if (player?.IsPlaying == true)
            {
                player.Pause();
            }

            return;
        }

        if (player is null)
        {
            CreatePlayer();
            return;
        }

        if (prepared && !player.IsPlaying && RequestFocus())
        {
            player.Start();
        }
    }

    void CreatePlayer()
    {
        if (path is null)
        {
            return;
        }

        var created = new MediaPlayer();
        try
        {
            created.SetAudioAttributes(new AudioAttributes.Builder()
                .SetUsage(AudioUsageKind.Media)!
                .SetContentType(AudioContentType.Music)!
                .Build()!);
            using var asset = context.Assets!.OpenFd(path);
            if (asset?.FileDescriptor is null)
            {
                created.Release();
                created.Dispose();
                return;
            }

            // The player duplicates the descriptor, so the asset entry can close here.
            created.SetDataSource(asset.FileDescriptor, asset.StartOffset, asset.Length);
            created.Looping = true;
            created.SetOnPreparedListener(new PreparedListener(this, created));
            created.PrepareAsync();
            player = created;
            prepared = false;
        }
        catch (Java.Lang.Exception)
        {
            // Without a player there is simply no ambient sound.
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
        UpdatePlayback();
    }

    void OnFocusChange(AudioFocus focusChange)
    {
        if (focusChange == AudioFocus.Gain)
        {
            hasFocus = focusRequest is not null;
            UpdatePlayback();
            return;
        }

        hasFocus = false;
        if (player?.IsPlaying == true)
        {
            player.Pause();
        }
    }

    bool RequestFocus()
    {
        AudioManager? audio = context.GetSystemService(Context.AudioService) as AudioManager;
        if (audio is null)
        {
            return true;
        }

        focusRequest ??= new AudioFocusRequestClass.Builder(AudioFocus.Gain)
            .SetAudioAttributes(new AudioAttributes.Builder()
                .SetUsage(AudioUsageKind.Media)!
                .SetContentType(AudioContentType.Music)!
                .Build()!)!
            .SetOnAudioFocusChangeListener(focusListener)!
            .Build();
        if (hasFocus)
        {
            return true;
        }

        hasFocus = focusRequest is not null && audio.RequestAudioFocus(focusRequest) == AudioFocusRequest.Granted;
        return hasFocus;
    }

    void ReleasePlayer()
    {
        if (player is { } current)
        {
            player = null;
            prepared = false;
            hasFocus = false;
            current.Release();
            current.Dispose();
        }

        if (focusRequest is { } request)
        {
            focusRequest = null;
            (context.GetSystemService(Context.AudioService) as AudioManager)?.AbandonAudioFocusRequest(request);
            request.Dispose();
        }
    }

    sealed class PreparedListener(AmbientSound owner, MediaPlayer created) : Java.Lang.Object, MediaPlayer.IOnPreparedListener
    {
        public void OnPrepared(MediaPlayer? mp) => owner.OnPrepared(created);
    }

    sealed class FocusChangeListener(AmbientSound owner) : Java.Lang.Object, AudioManager.IOnAudioFocusChangeListener
    {
        public void OnAudioFocusChange(AudioFocus focusChange) => owner.OnFocusChange(focusChange);
    }
}
#pragma warning restore CA2213
