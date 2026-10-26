#pragma warning disable CA1031 // Every storage failure is reported as OneLinerNotSaved, by design.
using CalmInTheRush.Application.Experiences;
using CalmInTheRush.Domain.Experiences;
using CalmInTheRush.Domain.Visitors;

namespace CalmInTheRush.Application.Visitors;

public sealed class SaveOneLinerCommandHandler(IVisitorStore visitorStore, ExperienceStore store)
{
    public async Task<SaveOneLinerResult> HandleAsync(SaveOneLinerCommand command, CancellationToken cancellationToken)
    {
        var trimmed = command.Value.Trim();
        if (trimmed.Length > Experience.OneLinerMaxLength)
        {
            return new OneLinerTooLong(Experience.OneLinerMaxLength);
        }

        try
        {
            var next = new VisitorState(store.Visitor.Uploads, trimmed);
            await visitorStore.SaveAsync(next, cancellationToken).ConfigureAwait(false);
            store.Apply(next);
            if (trimmed.Length == 0)
            {
                return new OneLinerCleared();
            }

            return new OneLinerSaved(trimmed);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            return new OneLinerNotSaved();
        }
    }
}
#pragma warning restore CA1031
