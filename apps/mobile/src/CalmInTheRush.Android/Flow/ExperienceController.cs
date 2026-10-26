namespace CalmInTheRush.Android.Flow;

using global::Android.Content;
using global::Android.Views;
using global::Android.Widget;
using CalmInTheRush.Android.Chrome;
using CalmInTheRush.Android.Media;
using CalmInTheRush.Android.Screens;
using CalmInTheRush.Android.Ui;
using CalmInTheRush.Application.Experiences;
using CalmInTheRush.Application.Visitors;
using CalmInTheRush.Domain.Experiences;

/// <summary>
///     Owns the visitor flow: which screen shows, the open tile, the ambient sound, and the
///     results of the visitor's commands. Screens raise events; only this type navigates.
/// </summary>
public sealed class ExperienceController : IDisposable
{
    const string QuietMomentsScreenId = "quiet-moments";

    readonly Activity activity;
    readonly ExperienceStore store;
    readonly IVisitorStore visitorStore;
    readonly FrameLayout root;
    readonly FrameLayout content;
    readonly FrameLayout overlay;
    readonly SoundToggleButton soundToggle;
    readonly NavigationBarView navigation;
    readonly MessageBannerView banner;
    readonly AmbientSound sound;
    FlowState state;

    public ExperienceController(Activity activity, ExperienceStore store, IVisitorStore visitorStore, FlowState state)
    {
        this.activity = activity;
        this.store = store;
        this.visitorStore = visitorStore;
        this.state = state;
        sound = new AmbientSound(activity);

        root = new FrameLayout(activity) { ContentDescription = activity.GetString(Resource.String.experience_label) };
        content = new FrameLayout(activity);
        overlay = new FrameLayout(activity);
        soundToggle = new SoundToggleButton(activity) { SoundOn = true };
        navigation = new NavigationBarView(activity);
        banner = new MessageBannerView(activity);

        root.AddView(content, Fill());
        root.AddView(overlay, Fill());
        root.AddView(soundToggle, Corner(GravityFlags.Top | GravityFlags.End, 12));
        root.AddView(navigation, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.WrapContent, GravityFlags.Bottom));
        root.AddView(banner, Corner(GravityFlags.Bottom | GravityFlags.CenterHorizontal, 16));

        soundToggle.Click += (_, _) => ToggleSound();
        navigation.BackClicked += (_, _) => Go(state.Back(Experience));
        navigation.NextClicked += (_, _) => Go(state.Next(Experience));
        navigation.SeeMoreClicked += (_, _) => Go(state.SeeMore());
        root.SetOnApplyWindowInsetsListener(new InsetsListener(this));
    }

    /// <summary>Raised when the visitor asks for photos for an upload tile.</summary>
    public event EventHandler<TileEventArgs>? PhotosRequested;

    public View View => root;

    public FlowState State => state;

    Experience Experience => store.Experience;

    public void Show() => Render();

    /// <summary>Closes the open tile or steps back; false when the visitor is at the start and the app may close.</summary>
    public bool HandleBack()
    {
        if (state.OpenTile is not null)
        {
            Go(state.Close());
            return true;
        }

        if (!state.HasPrevious(Experience))
        {
            return false;
        }

        Go(state.Back(Experience));
        return true;
    }

    public void Pause() => sound.Pause();

    public void Resume() => sound.Resume();

    public async Task AddPhotosAsync(string screenId, string tileId, IReadOnlyList<PickedImage> photos)
    {
        if (photos.Count == 0)
        {
            return;
        }

        var handler = new AddVisitorPhotosCommandHandler(visitorStore, store);
        var result = await handler.HandleAsync(new AddVisitorPhotosCommand(screenId, tileId, photos), CancellationToken.None);
        Render();
        banner.Show(result switch
        {
            PhotosAdded { Saved: 1, Requested: 1 } => Text(Resource.String.photo_saved),
            PhotosAdded added when added.Saved < added.Requested => Text(Resource.String.photos_partial, added.Saved, added.Requested),
            PhotosAdded added => Text(Resource.String.photos_saved, added.Saved),
            NoEmptyUploadSlots => Text(Resource.String.upload_slots_full),
            _ => Text(Resource.String.photos_failed),
        });
    }

    public void Dispose() => sound.Dispose();

    void Go(FlowState next)
    {
        state = next;
        Render();
    }

    void Render()
    {
        content.RemoveAllViews();
        overlay.RemoveAllViews();
        content.AddView(ScreenView(), Fill());

        var openTile = OpenTileView();
        if (openTile is not null)
        {
            overlay.AddView(openTile, Fill());
        }

        RenderChrome(openTile is not null);
        root.RequestApplyInsets();
    }

    View ScreenView()
    {
        var screen = state.Screen(Experience);
        var cover = state.Cover(Experience);
        if (screen is GalleryScreen gallery && cover is not null && state.CoverVisible(Experience))
        {
            return new CoverScreenView(activity, gallery, cover);
        }

        return screen switch
        {
            GalleryScreen grid => Gallery(grid),
            BreathingScreen breathing => new BreathingScreenView(activity, breathing),
            GatewayScreen gateway => Gateway(gateway),
            _ => Message(Resource.String.no_screens_title),
        };
    }

    GalleryScreenView Gallery(GalleryScreen screen)
    {
        var hideCover = state.ScreenIndex == 0 && screen.UseFirstTileAsCover && !screen.RepeatCoverInGallery;
        var tiles = hideCover ? screen.Tiles.Skip(1).ToList() : screen.Tiles;
        var view = new GalleryScreenView(activity, screen, tiles, store.Visitor);
        view.TileOpened += (_, tile) => Go(state.Open(new TileReference(tile.ScreenId, tile.TileId)));
        view.UploadRequested += (_, tile) => PhotosRequested?.Invoke(this, tile);
        view.RemoveRequested += (_, tile) => ConfirmRemoval(tile);
        return view;
    }

    GatewayScreenView Gateway(GatewayScreen screen)
    {
        var last = state.ScreenIndex == Experience.Screens.Count - 1;
        var oneLiner = last && Experience.OneLiner.Enabled ? Experience.OneLiner : null;
        var view = new GatewayScreenView(activity, screen, Experience.Locale, oneLiner, store.Visitor.OneLiner);
        view.OneLinerSaveRequested += async (_, value) => await SaveOneLinerAsync(view, value);
        view.OneLinerClearRequested += async (_, _) => await SaveOneLinerAsync(view, string.Empty);
        view.LinkOpened += (_, link) => OpenLink(link);
        return view;
    }

    TileViewerView? OpenTileView()
    {
        if (state.OpenTile is not { } reference || Experience.FindScreen(reference.ScreenId) is not GalleryScreen screen)
        {
            return null;
        }

        var tile = screen.Tiles.FirstOrDefault(candidate => candidate.Id == reference.TileId);
        var (media, alt) = tile switch
        {
            PrefilledTile prefilled => (prefilled.Media, prefilled.Alt),
            UploadTile => store.Visitor.UploadFor(screen.Id, reference.TileId) is { } upload
                ? ((ExperienceMedia?)upload.Media, upload.Media.FileName)
                : (null, string.Empty),
            _ => (null, string.Empty),
        };
        if (tile is null || media is null)
        {
            return null;
        }

        var sentence = screen.Id == QuietMomentsScreenId && tile is PrefilledTile ? tile.Sentence : string.Empty;
        var view = new TileViewerView(activity, screen, tile, media, alt, sentence);
        view.ReplaceRequested += (_, target) => PhotosRequested?.Invoke(this, target);
        return view;
    }

    void RenderChrome(bool tileOpen)
    {
        var coverVisible = state.CoverVisible(Experience);
        if (coverVisible || tileOpen)
        {
            navigation.ShowSeeMore();
        }
        else
        {
            navigation.ShowPaging(state.ScreenIndex + 1, Experience.Screens.Count, state.HasPrevious(Experience), state.HasNext(Experience));
        }

        var audio = AudibleAudio(coverVisible);
        sound.Play(audio);
        soundToggle.Visibility = audio is null ? ViewStates.Gone : ViewStates.Visible;
        SystemBars.UseLightIcons(activity, coverVisible || tileOpen);
    }

    string? AudibleAudio(bool coverVisible)
    {
        if (state.OpenTile is { } open)
        {
            return Experience.FindTile(open.ScreenId, open.TileId) is PrefilledTile { Media: BundledVideo video } ? video.AudioAssetPath : null;
        }

        return coverVisible && state.Cover(Experience)?.Media is BundledVideo cover ? cover.AudioAssetPath : null;
    }

    void ToggleSound()
    {
        sound.Enabled = !sound.Enabled;
        soundToggle.SoundOn = sound.Enabled;
    }

    void ConfirmRemoval(TileEventArgs tile) =>
        new AlertDialog.Builder(activity)
            .SetTitle(Resource.String.remove_photo_title)!
            .SetMessage(Resource.String.remove_photo_description)!
            .SetNegativeButton(Resource.String.keep_it, (_, _) => { })!
            .SetPositiveButton(Resource.String.remove, async (_, _) => await RemoveAsync(tile))!
            .Show();

    async Task RemoveAsync(TileEventArgs tile)
    {
        var handler = new RemoveVisitorPhotoCommandHandler(visitorStore, store);
        var result = await handler.HandleAsync(new RemoveVisitorPhotoCommand(tile.ScreenId, tile.TileId), CancellationToken.None);
        Render();
        banner.Show(result is PhotoRemoved ? Text(Resource.String.photo_removed) : Text(Resource.String.photo_remove_failed));
    }

    async Task SaveOneLinerAsync(GatewayScreenView view, string value)
    {
        view.SetSaving(true);
        var handler = new SaveOneLinerCommandHandler(visitorStore, store);
        var result = await handler.HandleAsync(new SaveOneLinerCommand(value), CancellationToken.None);
        view.SetSaving(false);
        view.ShowSavedOneLiner(store.Visitor.OneLiner);
        banner.Show(result switch
        {
            OneLinerSaved => Text(Resource.String.one_liner_saved),
            OneLinerCleared => Text(Resource.String.one_liner_cleared),
            OneLinerTooLong => Text(Resource.String.one_liner_too_long),
            _ => Text(Resource.String.one_liner_failed),
        });
    }

    void OpenLink(ExternalLink link)
    {
        var intent = new Intent(Intent.ActionView, global::Android.Net.Uri.Parse(link.Url));
        if (intent.ResolveActivity(activity.PackageManager!) is not null)
        {
            activity.StartActivity(intent);
        }
    }

    TextView Message(int text) => new(activity)
    {
        Text = activity.GetString(text),
        Gravity = GravityFlags.Center,
    };

    string Text(int id, params Java.Lang.Object[] args) => activity.GetString(id, args);

    static FrameLayout.LayoutParams Fill() => new(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.MatchParent);

    FrameLayout.LayoutParams Corner(GravityFlags gravity, int marginDp)
    {
        var margin = Units.Dp(activity, marginDp);
        var layout = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WrapContent, ViewGroup.LayoutParams.WrapContent, gravity);
        layout.SetMargins(margin, margin, margin, margin);
        return layout;
    }

    /// <summary>Keeps the sound toggle below the status bar and the banner above the bottom bar.</summary>
    sealed class InsetsListener(ExperienceController controller) : Java.Lang.Object, View.IOnApplyWindowInsetsListener
    {
        public WindowInsets OnApplyWindowInsets(View view, WindowInsets insets)
        {
            var (top, bottom) = SystemInsets.Read(insets);
            var context = controller.activity;
            if (controller.soundToggle.LayoutParameters is FrameLayout.LayoutParams toggle)
            {
                toggle.TopMargin = top + Units.Dp(context, 12);
                controller.soundToggle.LayoutParameters = toggle;
            }

            if (controller.banner.LayoutParameters is FrameLayout.LayoutParams banner)
            {
                banner.BottomMargin = bottom + Units.Dp(context, 72);
                controller.banner.LayoutParameters = banner;
            }

            return insets;
        }
    }
}
