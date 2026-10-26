#pragma warning disable CA1031 // Every storage failure is reported as PhotosNotSaved, by design.
using CalmInTheRush.Application.Experiences;
using CalmInTheRush.Domain.Experiences;
using CalmInTheRush.Domain.Visitors;

namespace CalmInTheRush.Application.Visitors;

public sealed class AddVisitorPhotosCommandHandler(IVisitorStore visitorStore, ExperienceStore store)
{
    private static readonly HashSet<string> AcceptedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
    };

    public async Task<AddVisitorPhotosResult> HandleAsync(AddVisitorPhotosCommand command, CancellationToken cancellationToken)
    {
        if (store.Experience.FindScreen(command.ScreenId) is not GalleryScreen screen
            || screen.Tiles.FirstOrDefault(tile => tile.Id == command.TileId) is not UploadTile)
        {
            return new UploadTileGone();
        }

        if (command.Photos.Count == 0)
        {
            return new NoEmptyUploadSlots();
        }

        var filled = new HashSet<string>(
            store.Visitor.Uploads
                .Where(upload => upload.ScreenId == command.ScreenId)
                .Select(upload => upload.TileId),
            StringComparer.Ordinal);
        var emptyTiles = screen.Tiles
            .OfType<UploadTile>()
            .Where(tile => tile.Id != command.TileId && !filled.Contains(tile.Id))
            .Select(tile => tile.Id)
            .ToList();
        var pairs = new List<(PickedImage Photo, string TileId)>(command.Photos.Count)
        {
            (command.Photos[0], command.TileId),
        };
        for (var index = 1; index < command.Photos.Count && index - 1 < emptyTiles.Count; index++)
        {
            pairs.Add((command.Photos[index], emptyTiles[index - 1]));
        }

        var imported = new List<(string TileId, LocalImage Image)>(pairs.Count);
        try
        {
            foreach (var (photo, tileId) in pairs)
            {
                if (!AcceptedMimeTypes.Contains(photo.MimeType))
                {
                    continue;
                }

                await using var stream = await photo.OpenAsync(cancellationToken).ConfigureAwait(false);
                var image = await visitorStore
                    .ImportImageAsync(stream, photo.FileName, photo.MimeType, cancellationToken)
                    .ConfigureAwait(false);
                imported.Add((tileId, image));
            }

            if (imported.Count == 0)
            {
                return new NoEmptyUploadSlots();
            }

            var uploads = new Dictionary<(string ScreenId, string TileId), VisitorUpload>();
            foreach (var upload in store.Visitor.Uploads)
            {
                uploads[(upload.ScreenId, upload.TileId)] = upload;
            }

            var replaced = new List<LocalImage>(imported.Count);
            foreach (var (tileId, image) in imported)
            {
                var key = (command.ScreenId, tileId);
                if (uploads.TryGetValue(key, out var previous))
                {
                    replaced.Add(previous.Media);
                }

                uploads[key] = new VisitorUpload(command.ScreenId, tileId, image);
            }

            var next = new VisitorState([.. uploads.Values], store.Visitor.OneLiner);
            await visitorStore.SaveAsync(next, cancellationToken).ConfigureAwait(false);
            store.Apply(next);
            foreach (var old in replaced)
            {
                await visitorStore.DeleteImageAsync(old, CancellationToken.None).ConfigureAwait(false);
            }

            return new PhotosAdded(imported.Count, command.Photos.Count);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            foreach (var (_, image) in imported)
            {
                try
                {
                    await visitorStore.DeleteImageAsync(image, CancellationToken.None).ConfigureAwait(false);
                }
                catch (Exception)
                {
                    // Best effort: the orphaned copy stays in private storage.
                }
            }

            return new PhotosNotSaved();
        }
    }
}
#pragma warning restore CA1031
