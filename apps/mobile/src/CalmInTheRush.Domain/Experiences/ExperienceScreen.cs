namespace CalmInTheRush.Domain.Experiences;

/// <summary>One page of the visitor flow.</summary>
public abstract record ExperienceScreen(string Id, string Title, string Description);

/// <summary>A two-column grid of photos and upload slots, optionally opened by a full-screen cover.</summary>
public sealed record GalleryScreen(
    string Id,
    string Title,
    string Description,
    bool UseFirstTileAsCover,
    bool RepeatCoverInGallery,
    IReadOnlyList<ExperienceTile> Tiles) : ExperienceScreen(Id, Title, Description)
{
    /// <summary>The first tile when it can serve as a cover, otherwise null.</summary>
    public PrefilledTile? Cover => UseFirstTileAsCover && Tiles.Count > 0 ? Tiles[0] as PrefilledTile : null;
}

/// <summary>A calm motion cue the visitor follows at their own pace.</summary>
public sealed record BreathingScreen(string Id, string Title, string Description)
    : ExperienceScreen(Id, Title, Description);

/// <summary>A closing screen showing the brand, optional links, and the reflection prompt on the last one.</summary>
public sealed record GatewayScreen(
    string Id,
    string Title,
    string Description,
    IReadOnlyList<ExternalLink> Links) : ExperienceScreen(Id, Title, Description);

/// <summary>A link that leaves the app.</summary>
public sealed record ExternalLink(string Id, string Label, string Url);
