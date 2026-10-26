using CalmInTheRush.Domain.Experiences;
using CalmInTheRush.Domain.Visitors;

namespace CalmInTheRush.Application.Visitors;

public interface IVisitorStore
{
    Task<VisitorState> LoadAsync(CancellationToken cancellationToken);

    Task SaveAsync(VisitorState state, CancellationToken cancellationToken);

    Task<LocalImage> ImportImageAsync(Stream source, string fileName, string mimeType, CancellationToken cancellationToken);

    Task DeleteImageAsync(LocalImage image, CancellationToken cancellationToken);
}
