namespace CalmInTheRush.Domain.Experiences;

/// <summary>Who made a bundled media file, under which license, and how it was changed.</summary>
public sealed record MediaAttribution(
    string Author,
    string LicenseName,
    string? LicenseUrl,
    string SourceUrl,
    string Changes);
