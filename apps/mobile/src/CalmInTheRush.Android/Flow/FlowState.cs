namespace CalmInTheRush.Android.Flow;

using CalmInTheRush.Domain.Experiences;

/// <summary>
///     Where the visitor is: the screen, whether the opening cover still shows, and the open tile.
///     Mirrors the navigation rules of the web demo's visitor flow.
/// </summary>
public sealed record FlowState(int ScreenIndex, bool ShowCover, TileReference? OpenTile)
{
    public static readonly FlowState Start = new(0, true, null);

    public ExperienceScreen? Screen(Experience experience) =>
        ScreenIndex >= 0 && ScreenIndex < experience.Screens.Count ? experience.Screens[ScreenIndex] : null;

    public PrefilledTile? Cover(Experience experience) => (Screen(experience) as GalleryScreen)?.Cover;

    public bool CoverVisible(Experience experience) => ScreenIndex == 0 && ShowCover && Cover(experience) is not null;

    public bool HasPrevious(Experience experience) =>
        ScreenIndex > 0 || (!CoverVisible(experience) && Cover(experience) is not null);

    public bool HasNext(Experience experience) => ScreenIndex < experience.Screens.Count - 1;

    public FlowState Back(Experience experience)
    {
        if (ScreenIndex == 0 && !CoverVisible(experience) && Cover(experience) is not null)
        {
            return this with { ShowCover = true, OpenTile = null };
        }

        return ScreenIndex > 0 ? new FlowState(ScreenIndex - 1, false, null) : this with { OpenTile = null };
    }

    public FlowState Next(Experience experience) =>
        HasNext(experience) ? new FlowState(ScreenIndex + 1, false, null) : this with { OpenTile = null };

    public FlowState SeeMore() => this with { ShowCover = false, OpenTile = null };

    public FlowState Open(TileReference tile) => this with { OpenTile = tile };

    public FlowState Close() => this with { OpenTile = null };
}

/// <summary>One tile on one gallery screen.</summary>
public sealed record TileReference(string ScreenId, string TileId);
