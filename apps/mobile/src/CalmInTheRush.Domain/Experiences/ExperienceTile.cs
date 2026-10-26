namespace CalmInTheRush.Domain.Experiences;

/// <summary>One cell of a gallery screen.</summary>
public abstract record ExperienceTile(string Id, string Sentence);

/// <summary>A tile whose media ships with the experience.</summary>
public sealed record PrefilledTile(
    string Id,
    string Title,
    string Alt,
    string Sentence,
    ExperienceMedia Media,
    MediaAttribution? Attribution = null) : ExperienceTile(Id, Sentence);

/// <summary>An empty slot the visitor fills with a photo of their own.</summary>
public sealed record UploadTile(string Id, string Label, string Sentence = "") : ExperienceTile(Id, Sentence);
