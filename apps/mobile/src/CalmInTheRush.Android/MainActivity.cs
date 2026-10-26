namespace CalmInTheRush.Android;

using global::Android.Content;
using global::Android.Content.PM;
using global::Android.OS;
using global::Android.Provider;
using global::Android.Views;
using global::Android.Widget;
using global::Android.Window;
using CalmInTheRush.Android.Flow;
using CalmInTheRush.Android.Ui;
using CalmInTheRush.Android.Screens;
using CalmInTheRush.Application.Experiences;
using CalmInTheRush.Application.Visitors;
using CalmInTheRush.Domain.Experiences;
using CalmInTheRush.Infrastructure.Visitors;

[Activity(
    Label = "@string/app_name",
    MainLauncher = true,
    Theme = "@style/Theme.Calm",
    ScreenOrientation = ScreenOrientation.Portrait,
    ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.ScreenSize | ConfigChanges.ScreenLayout | ConfigChanges.UiMode)]
public sealed class MainActivity : Activity
{
    const int PickPhotosRequest = 1;
    const int MaxPickedPhotos = 4;
    const string StateScreen = "flow.screen";
    const string StateCover = "flow.cover";
    const string StateOpenScreen = "flow.open.screen";
    const string StateOpenTile = "flow.open.tile";
    const string StatePickScreen = "pick.screen";
    const string StatePickTile = "pick.tile";

    IVisitorStore? visitorStore;
    ExperienceController? controller;
    BackCallback? backCallback;
    TileEventArgs? pickTarget;

    protected override async void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);
        SystemBars.DrawEdgeToEdge(this);
        SetContentView(Preparing());
        pickTarget = RestorePickTarget(savedInstanceState);
        RegisterBack();

        try
        {
            await StartAsync(RestoreFlow(savedInstanceState));
        }
        catch (Exception exception)
        {
            global::Android.Util.Log.Error(nameof(MainActivity), exception.ToString());
            Toast.MakeText(this, Resource.String.experience_unreadable, ToastLength.Long)?.Show();
        }
    }

    protected override void OnPause()
    {
        controller?.Pause();
        base.OnPause();
    }

    protected override void OnResume()
    {
        base.OnResume();
        controller?.Resume();
    }

    protected override void OnSaveInstanceState(Bundle outState)
    {
        base.OnSaveInstanceState(outState);
        if (controller?.State is { } state)
        {
            outState.PutInt(StateScreen, state.ScreenIndex);
            outState.PutBoolean(StateCover, state.ShowCover);
            outState.PutString(StateOpenScreen, state.OpenTile?.ScreenId);
            outState.PutString(StateOpenTile, state.OpenTile?.TileId);
        }

        outState.PutString(StatePickScreen, pickTarget?.ScreenId);
        outState.PutString(StatePickTile, pickTarget?.TileId);
    }

    protected override void OnDestroy()
    {
        if (backCallback is not null && OperatingSystem.IsAndroidVersionAtLeast(33))
        {
            OnBackInvokedDispatcher.UnregisterOnBackInvokedCallback(backCallback);
        }

        controller?.Dispose();
        base.OnDestroy();
    }

#pragma warning disable CA1422, CS0672 // OnBackPressed is the back path below API 33; API 33+ uses the dispatcher.
    public override void OnBackPressed()
    {
        if (controller?.HandleBack() != true)
        {
            base.OnBackPressed();
        }
    }
#pragma warning restore CA1422, CS0672

    protected override async void OnActivityResult(int requestCode, Result resultCode, Intent? data)
    {
        base.OnActivityResult(requestCode, resultCode, data);
        var target = pickTarget;
        pickTarget = null;
        if (requestCode != PickPhotosRequest || resultCode != Result.Ok || data is null || target is null || controller is null)
        {
            return;
        }

        try
        {
            await controller.AddPhotosAsync(target.ScreenId, target.TileId, PickedImages(data));
        }
        catch (Exception exception)
        {
            global::Android.Util.Log.Error(nameof(MainActivity), exception.ToString());
        }
    }

    async Task StartAsync(FlowState flow)
    {
        visitorStore = new FileVisitorStore(Path.Combine(FilesDir!.AbsolutePath, "visitor"));
        var locale = ExperienceLocale.FromLanguage(Resources!.Configuration!.Locales.Get(0)?.Language);
        var result = await new LoadExperienceQueryHandler(visitorStore).HandleAsync(new LoadExperienceQuery(locale), CancellationToken.None);
        var store = result switch
        {
            ExperienceLoaded loaded => loaded.Store,
            VisitorStateUnreadable unreadable => unreadable.Store,
            _ => throw new InvalidOperationException(result.GetType().Name),
        };

        controller = new ExperienceController(this, store, visitorStore, Valid(flow, store.Experience));
        controller.PhotosRequested += (_, target) => PickPhotos(target);
        SetContentView(controller.View);
        controller.Show();
        if (result is VisitorStateUnreadable)
        {
            Toast.MakeText(this, Resource.String.experience_unreadable, ToastLength.Long)?.Show();
        }
    }

    void RegisterBack()
    {
        if (!OperatingSystem.IsAndroidVersionAtLeast(33))
        {
            return;
        }

        backCallback = new BackCallback(this);
        OnBackInvokedDispatcher.RegisterOnBackInvokedCallback(0, backCallback);
    }

    void HandleBackGesture()
    {
        if (controller?.HandleBack() != true)
        {
            Finish();
        }
    }

    void PickPhotos(TileEventArgs target)
    {
        pickTarget = target;
        var intent = OperatingSystem.IsAndroidVersionAtLeast(33)
            ? new Intent(MediaStore.ActionPickImages).PutExtra(MediaStore.ExtraPickImagesMax, MaxPickedPhotos)
            : new Intent(Intent.ActionGetContent).SetType("image/*").PutExtra(Intent.ExtraAllowMultiple, true).AddCategory(Intent.CategoryOpenable);
        StartActivityForResult(intent, PickPhotosRequest);
    }

    List<PickedImage> PickedImages(Intent data)
    {
        var uris = new List<global::Android.Net.Uri>();
        if (data.ClipData is { } clip)
        {
            for (var index = 0; index < clip.ItemCount; index++)
            {
                if (clip.GetItemAt(index)?.Uri is { } uri)
                {
                    uris.Add(uri);
                }
            }
        }
        else if (data.Data is { } single)
        {
            uris.Add(single);
        }

        return uris.Select(Picked).ToList();
    }

    PickedImage Picked(global::Android.Net.Uri uri)
    {
        var resolver = ContentResolver!;
        var mimeType = resolver.GetType(uri) ?? "application/octet-stream";
        return new PickedImage(DisplayName(uri) ?? "photo", mimeType, _ =>
            Task.FromResult(resolver.OpenInputStream(uri) ?? throw new IOException($"Cannot open {uri}")));
    }

    string? DisplayName(global::Android.Net.Uri uri)
    {
        using var cursor = ContentResolver!.Query(uri, [IOpenableColumns.DisplayName], null, null, null);
        return cursor is not null && cursor.MoveToFirst() ? cursor.GetString(0) : null;
    }

    TextView Preparing()
    {
        var text = new TextView(this) { Gravity = GravityFlags.Center, Text = GetString(Resource.String.preparing) };
        text.SetTextColor(this.ColorOf(Resource.Color.calm_muted_foreground));
        return text;
    }

    static FlowState RestoreFlow(Bundle? saved)
    {
        if (saved is null)
        {
            return FlowState.Start;
        }

        var openScreen = saved.GetString(StateOpenScreen);
        var openTile = saved.GetString(StateOpenTile);
        var open = openScreen is not null && openTile is not null ? new TileReference(openScreen, openTile) : null;
        return new FlowState(saved.GetInt(StateScreen), saved.GetBoolean(StateCover, true), open);
    }

    static TileEventArgs? RestorePickTarget(Bundle? saved) =>
        saved?.GetString(StatePickScreen) is { } screen && saved.GetString(StatePickTile) is { } tile
            ? new TileEventArgs(screen, tile)
            : null;

    static FlowState Valid(FlowState flow, Experience experience) =>
        flow.ScreenIndex < experience.Screens.Count ? flow : FlowState.Start;

    sealed class BackCallback(MainActivity activity) : Java.Lang.Object, IOnBackInvokedCallback
    {
        public void OnBackInvoked() => activity.HandleBackGesture();
    }
}
