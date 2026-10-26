namespace CalmInTheRush.Domain.Visitors;

/// <summary>Everything the visitor made: their photos and their one-liner. Durable and device-local.</summary>
public sealed record VisitorState(IReadOnlyList<VisitorUpload> Uploads, string OneLiner)
{
    public static readonly VisitorState Empty = new([], string.Empty);

    public VisitorUpload? UploadFor(string screenId, string tileId) =>
        Uploads.FirstOrDefault(upload => upload.ScreenId == screenId && upload.TileId == tileId);
}
