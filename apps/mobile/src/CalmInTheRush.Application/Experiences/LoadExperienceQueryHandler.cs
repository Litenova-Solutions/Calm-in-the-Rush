#pragma warning disable CA1031 // Any load failure is reported as VisitorStateUnreadable, by design.
using CalmInTheRush.Application.Visitors;
using CalmInTheRush.Domain.Experiences;
using CalmInTheRush.Domain.Visitors;

namespace CalmInTheRush.Application.Experiences;

public sealed class LoadExperienceQueryHandler(IVisitorStore visitorStore)
{
    public async Task<LoadExperienceResult> HandleAsync(LoadExperienceQuery query, CancellationToken cancellationToken)
    {
        var experience = ExperienceSeeds.For(query.Locale);
        try
        {
            var loaded = await visitorStore.LoadAsync(cancellationToken).ConfigureAwait(false);
            var kept = loaded.Uploads
                .Where(upload => experience.FindTile(upload.ScreenId, upload.TileId) is UploadTile)
                .ToList();
            var store = new ExperienceStore(experience, new VisitorState(kept, loaded.OneLiner));
            return new ExperienceLoaded(store);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            return new VisitorStateUnreadable(new ExperienceStore(experience, VisitorState.Empty));
        }
    }
}
#pragma warning restore CA1031
