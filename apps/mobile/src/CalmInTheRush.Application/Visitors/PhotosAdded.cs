namespace CalmInTheRush.Application.Visitors;

public sealed record PhotosAdded(int Saved, int Requested) : AddVisitorPhotosResult;
