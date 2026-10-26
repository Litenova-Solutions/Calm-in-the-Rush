namespace CalmInTheRush.Android.Screens;

public sealed class TileEventArgs(string screenId, string tileId) : EventArgs
{
    public string ScreenId { get; } = screenId;

    public string TileId { get; } = tileId;
}
