using CalmInTheRush.Domain.Experiences;

namespace CalmInTheRush.Application.Experiences;

public static class ExperienceSeeds
{
    private static readonly MediaAttribution MeadowAttribution = new(
        "Matt Richmond",
        "Pexels license",
        "https://www.pexels.com/license/",
        "https://www.pexels.com/video/serene-green-meadow-swaying-in-soft-breeze-31160414/",
        "Scaled to 480 wide, 8 second excerpt, muted.");

    private static readonly MediaAttribution WheatAttribution = new(
        "Yasar Baskurt",
        "Pexels license",
        "https://www.pexels.com/license/",
        "https://www.pexels.com/video/wind-blowing-through-golden-wheat-field-32508413/",
        "Scaled to 480 wide, muted.");

    private static readonly MediaAttribution VallaAttribution = new(
        "Lauri Poldre",
        "Pexels license",
        "https://www.pexels.com/license/",
        "https://www.pexels.com/video/serene-sunlit-boreal-forest-scene-35504127/",
        "12 second excerpt, scaled to 480 wide, muted.");

    private static readonly MediaAttribution BrookAttribution = new(
        "Dr Photographer",
        "Pexels license",
        "https://www.pexels.com/license/",
        "https://www.pexels.com/video/serene-mountain-stream-flowing-over-rocks-38008512/",
        "Slowed to quarter speed, cropped to portrait, 8 second excerpt, muted.");

    public static Experience For(ExperienceLocale locale) =>
        locale == ExperienceLocale.Dutch ? Dutch() : English();

    private static Experience English() => new(
        ExperienceLocale.English,
        [
            new GalleryScreen(
                "nature",
                "Nature",
                "Take a moment with the places that help you slow down.",
                true,
                false,
                [
                    new PrefilledTile(
                        "cover-meadow",
                        "Green meadow",
                        "Tall grass swaying in a soft breeze.",
                        "Take a breath.",
                        new BundledVideo(
                            "media/experience/nature-meadow.webm",
                            "media/experience/nature-meadow-poster.jpg",
                            "media/experience/audio-wheat.mp3"),
                        MeadowAttribution),
                    new PrefilledTile(
                        "nature-wheat",
                        "Wheat field",
                        "Golden wheat swaying in a gentle breeze.",
                        "Take a breath.",
                        new BundledVideo(
                            "media/experience/nature-wheat.webm",
                            "media/experience/nature-wheat-poster.jpg",
                            "media/experience/audio-wheat.mp3"),
                        WheatAttribution),
                    new PrefilledTile(
                        "nature-valla",
                        "Forest",
                        "Sunlit conifer trees in a boreal forest.",
                        "Let the next breath arrive on its own.",
                        new BundledVideo(
                            "media/experience/nature-valla.webm",
                            "media/experience/nature-valla-poster.jpg",
                            "media/experience/audio-forest.mp3"),
                        VallaAttribution),
                    new PrefilledTile(
                        "nature-brook",
                        "Mountain brook",
                        "A calm mountain stream flowing over smooth rocks.",
                        "Take a breath.",
                        new BundledVideo(
                            "media/experience/cover-brook.webm",
                            "media/experience/cover-brook-poster.jpg",
                            "media/experience/audio-brook.mp3"),
                        BrookAttribution),
                    new UploadTile("nature-upload", "Add a nature photo", "A place that helps you pause."),
                ]),
            new GalleryScreen(
                "quiet-moments",
                "Quiet Moments",
                "Calm can exist in the middle of everyday life.",
                false,
                false,
                [
                    new PrefilledTile(
                        "quiet-city-reading",
                        "CALM in the rush",
                        "A person reading on a city bench while pedestrians move around them.",
                        "CALM in the rush.",
                        new BundledImage("media/experience/quiet-city-reading.webp")),
                    new PrefilledTile(
                        "quiet-window-tea",
                        "A quiet cup of tea",
                        "A person holding tea by a rain-speckled window.",
                        "A small pause can be enough.",
                        new BundledImage("media/experience/quiet-window-tea.webp")),
                    new PrefilledTile(
                        "quiet-balcony-garden",
                        "Tending herbs",
                        "A person tending herbs on an apartment balcony.",
                        "Take your time.",
                        new BundledImage("media/experience/quiet-balcony-garden.webp")),
                    new UploadTile("quiet-upload", "Add a quiet moment", "Your own quiet moment."),
                ]),
            new GalleryScreen(
                "friendly-faces",
                "Relaxed Faces",
                "Add people whose relaxed presence matters to you.",
                false,
                false,
                [
                    new UploadTile(
                        "friendly-self-upload",
                        "Add a relaxed photo of yourself",
                        "A relaxed moment of your own."),
                    new UploadTile(
                        "friendly-other-upload",
                        "Add a friendly or relaxed photo of someone else",
                        "Someone whose presence feels good."),
                    new UploadTile("friendly-third-upload", "Add another relaxed photo"),
                    new UploadTile("friendly-fourth-upload", "Add one more relaxed photo"),
                ]),
            new BreathingScreen(
                "take-a-breath",
                "Take a Breath",
                "Follow the gentle movement at your own pace."),
            new GatewayScreen("calm-logo", "CALM in the Rush", string.Empty, []),
            new GatewayScreen("calm-quote", "Your Calm Quote", string.Empty, []),
        ],
        new OneLinerSettings(true, "What is calm for you?", "For me, calm is..."));

    private static Experience Dutch() => new(
        ExperienceLocale.Dutch,
        [
            new GalleryScreen(
                "nature",
                "Natuur",
                "Neem even de tijd voor de plekken waar je tot rust komt.",
                true,
                false,
                [
                    new PrefilledTile(
                        "cover-meadow",
                        "Groene weide",
                        "Hoog gras dat zachtjes in de bries beweegt.",
                        "Haal even adem.",
                        new BundledVideo(
                            "media/experience/nature-meadow.webm",
                            "media/experience/nature-meadow-poster.jpg",
                            "media/experience/audio-wheat.mp3"),
                        MeadowAttribution),
                    new PrefilledTile(
                        "nature-wheat",
                        "Korenveld",
                        "Goudgeel koren dat in een zachte bries beweegt.",
                        "Haal adem.",
                        new BundledVideo(
                            "media/experience/nature-wheat.webm",
                            "media/experience/nature-wheat-poster.jpg",
                            "media/experience/audio-wheat.mp3"),
                        WheatAttribution),
                    new PrefilledTile(
                        "nature-valla",
                        "Bos",
                        "Zonverlichte naaldbomen in een boreaal bos.",
                        "Laat de volgende adem vanzelf komen.",
                        new BundledVideo(
                            "media/experience/nature-valla.webm",
                            "media/experience/nature-valla-poster.jpg",
                            "media/experience/audio-forest.mp3"),
                        VallaAttribution),
                    new PrefilledTile(
                        "nature-brook",
                        "Bergbeek",
                        "Een rustig bergbeekje dat over gladde stenen stroomt.",
                        "Haal adem.",
                        new BundledVideo(
                            "media/experience/cover-brook.webm",
                            "media/experience/cover-brook-poster.jpg",
                            "media/experience/audio-brook.mp3"),
                        BrookAttribution),
                    new UploadTile(
                        "nature-upload",
                        "Voeg een natuurfoto toe",
                        "Een plek die je helpt om even stil te staan."),
                ]),
            new GalleryScreen(
                "quiet-moments",
                "Rust Momenten",
                "Rust kan bestaan midden in het dagelijks leven.",
                false,
                false,
                [
                    new PrefilledTile(
                        "quiet-city-reading",
                        "Rust in de drukte",
                        "Iemand die op een bankje in de stad leest terwijl voorbijgangers langslopen.",
                        "RUST in de drukte.",
                        new BundledImage("media/experience/quiet-city-reading.webp")),
                    new PrefilledTile(
                        "quiet-window-tea",
                        "Een rustig kopje thee",
                        "Iemand met thee bij een raam met regendruppels.",
                        "Een kleine pauze kan genoeg zijn.",
                        new BundledImage("media/experience/quiet-window-tea.webp")),
                    new PrefilledTile(
                        "quiet-balcony-garden",
                        "Kruiden verzorgen",
                        "Iemand die kruiden verzorgt op een balkon.",
                        "Neem je tijd.",
                        new BundledImage("media/experience/quiet-balcony-garden.webp")),
                    new UploadTile("quiet-upload", "Voeg een rust moment toe", "Je eigen rust moment."),
                ]),
            new GalleryScreen(
                "friendly-faces",
                "Ontspannen Gezichten",
                "Voeg mensen toe wiens ontspannen aanwezigheid belangrijk voor je is.",
                false,
                false,
                [
                    new UploadTile(
                        "friendly-self-upload",
                        "Voeg een ontspannen foto van jezelf toe",
                        "Een ontspannen moment van jezelf."),
                    new UploadTile(
                        "friendly-other-upload",
                        "Voeg een vriendelijke of ontspannen foto van iemand anders toe",
                        "Iemand wiens aanwezigheid goed voelt."),
                    new UploadTile("friendly-third-upload", "Voeg nog een ontspannen foto toe"),
                    new UploadTile("friendly-fourth-upload", "Voeg een extra ontspannen foto toe"),
                ]),
            new BreathingScreen(
                "take-a-breath",
                "Haal rustig adem",
                "Volg de zachte beweging in je eigen tempo."),
            new GatewayScreen("calm-logo", "Rust in de Drukte", string.Empty, []),
            new GatewayScreen("calm-quote", "Jouw Rust Quote", string.Empty, []),
        ],
        new OneLinerSettings(true, "Wat is rust voor jou?", "Voor mij is rust..."));
}
