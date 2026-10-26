namespace CalmInTheRush.Domain.Experiences;

/// <summary>A language the experience is written in.</summary>
public sealed record ExperienceLocale
{
    public static readonly ExperienceLocale English = new("en");
    public static readonly ExperienceLocale Dutch = new("nl");

    ExperienceLocale(string code) => Code = code;

    /// <summary>The two-letter language code.</summary>
    public string Code { get; }

    /// <summary>Dutch for a Dutch language tag, English for every other one.</summary>
    public static ExperienceLocale FromLanguage(string? language) =>
        string.Equals(language, Dutch.Code, StringComparison.OrdinalIgnoreCase) ? Dutch : English;
}
