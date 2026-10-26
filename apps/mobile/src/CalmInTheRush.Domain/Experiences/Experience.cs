namespace CalmInTheRush.Domain.Experiences;

/// <summary>The whole visitor flow in one language.</summary>
public sealed record Experience(ExperienceLocale Locale, IReadOnlyList<ExperienceScreen> Screens, OneLinerSettings OneLiner)
{
    /// <summary>The longest one-liner a visitor can keep.</summary>
    public const int OneLinerMaxLength = 160;

    public ExperienceScreen? FindScreen(string screenId) => Screens.FirstOrDefault(screen => screen.Id == screenId);

    public ExperienceTile? FindTile(string screenId, string tileId) =>
        FindScreen(screenId) is GalleryScreen gallery ? gallery.Tiles.FirstOrDefault(tile => tile.Id == tileId) : null;
}

/// <summary>The closing question that asks the visitor what calm is for them.</summary>
public sealed record OneLinerSettings(bool Enabled, string Prompt, string Placeholder);
