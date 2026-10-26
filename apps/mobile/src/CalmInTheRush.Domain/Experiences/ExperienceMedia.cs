namespace CalmInTheRush.Domain.Experiences;

/// <summary>A picture or moving image a tile shows. Asset paths are relative to the app's packed assets.</summary>
public abstract record ExperienceMedia;

/// <summary>A still image packed with the app.</summary>
public sealed record BundledImage(string AssetPath) : ExperienceMedia;

/// <summary>A looping muted video packed with the app, its still poster, and an optional ambient sound.</summary>
public sealed record BundledVideo(string AssetPath, string PosterAssetPath, string? AudioAssetPath) : ExperienceMedia;

/// <summary>A photo the visitor added, stored in the app's private storage.</summary>
public sealed record LocalImage(string StoredPath, string FileName, string MimeType, long Size) : ExperienceMedia;
