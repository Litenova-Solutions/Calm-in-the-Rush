namespace CalmInTheRush.Application.Visitors;

public sealed record AddVisitorPhotosCommand(string ScreenId, string TileId, IReadOnlyList<PickedImage> Photos);
