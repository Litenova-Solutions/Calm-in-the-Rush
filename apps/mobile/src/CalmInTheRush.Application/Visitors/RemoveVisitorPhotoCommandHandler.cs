#pragma warning disable CA1031 // Every storage failure is reported as PhotoNotRemoved, by design.
using CalmInTheRush.Application.Experiences;
using CalmInTheRush.Domain.Visitors;

namespace CalmInTheRush.Application.Visitors;

public sealed class RemoveVisitorPhotoCommandHandler(IVisitorStore visitorStore, ExperienceStore store)
{
    public async Task<RemoveVisitorPhotoResult> HandleAsync(RemoveVisitorPhotoCommand command, CancellationToken cancellationToken)
    {
        var existing = store.Visitor.UploadFor(command.ScreenId, command.TileId);
        if (existing is null)
        {
            return new PhotoRemoved();
        }

        try
        {
            await visitorStore.DeleteImageAsync(existing.Media, cancellationToken).ConfigureAwait(false);
            var uploads = store.Visitor.Uploads
                .Where(upload => upload.ScreenId != command.ScreenId || upload.TileId != command.TileId)
                .ToList();
            var next = new VisitorState(uploads, store.Visitor.OneLiner);
            await visitorStore.SaveAsync(next, cancellationToken).ConfigureAwait(false);
            store.Apply(next);
            return new PhotoRemoved();
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            return new PhotoNotRemoved();
        }
    }
}
#pragma warning restore CA1031
