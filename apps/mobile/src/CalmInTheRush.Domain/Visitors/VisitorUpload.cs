namespace CalmInTheRush.Domain.Visitors;

using CalmInTheRush.Domain.Experiences;

/// <summary>A photo the visitor placed in one upload tile.</summary>
public sealed record VisitorUpload(string ScreenId, string TileId, LocalImage Media);
