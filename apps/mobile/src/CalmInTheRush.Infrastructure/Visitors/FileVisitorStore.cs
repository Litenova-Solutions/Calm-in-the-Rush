using System.Text.Json;
using System.Text.Json.Serialization;
using CalmInTheRush.Application.Visitors;
using CalmInTheRush.Domain.Experiences;
using CalmInTheRush.Domain.Visitors;

namespace CalmInTheRush.Infrastructure.Visitors;

public sealed partial class FileVisitorStore(string rootDirectory) : IVisitorStore
{
    private const int SchemaVersion = 1;

    private static readonly Dictionary<string, string> ExtensionsByMimeType =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = ".jpg",
            ["image/png"] = ".png",
            ["image/webp"] = ".webp",
            ["image/avif"] = ".avif",
        };

    private string StatePath => Path.Combine(rootDirectory, "visitor.json");

    private string UploadsPath => Path.Combine(rootDirectory, "uploads");

    public async Task<VisitorState> LoadAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(StatePath))
        {
            return VisitorState.Empty;
        }

        await using var stream = File.OpenRead(StatePath);
        var dto = await JsonSerializer.DeserializeAsync(
            stream,
            VisitorJsonContext.Default.VisitorStateDto,
            cancellationToken).ConfigureAwait(false);
        if (dto is null || dto.Uploads is null || dto.OneLiner is null)
        {
            throw new JsonException("The visitor state is missing or corrupt.");
        }

        if (dto.SchemaVersion != SchemaVersion)
        {
            throw new JsonException($"Unsupported visitor schema version {dto.SchemaVersion}.");
        }

        var uploads = new List<VisitorUpload>(dto.Uploads.Count);
        foreach (var upload in dto.Uploads)
        {
            if (upload is null
                || upload.ScreenId is null
                || upload.TileId is null
                || upload.StoredPath is null
                || upload.FileName is null
                || upload.MimeType is null)
            {
                throw new JsonException("A visitor upload is corrupt.");
            }

            uploads.Add(new VisitorUpload(
                upload.ScreenId,
                upload.TileId,
                new LocalImage(upload.StoredPath, upload.FileName, upload.MimeType, upload.Size)));
        }

        return new VisitorState(uploads, dto.OneLiner);
    }

    public async Task SaveAsync(VisitorState state, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(rootDirectory);
        var dto = new VisitorStateDto(
            SchemaVersion,
            state.Uploads.Select(upload => new VisitorUploadDto(
                upload.ScreenId,
                upload.TileId,
                upload.Media.StoredPath,
                upload.Media.FileName,
                upload.Media.MimeType,
                upload.Media.Size)).ToList(),
            state.OneLiner);
        var temporaryPath = StatePath + ".tmp";
        await using (var stream = File.Create(temporaryPath))
        {
            await JsonSerializer.SerializeAsync(
                stream,
                dto,
                VisitorJsonContext.Default.VisitorStateDto,
                cancellationToken).ConfigureAwait(false);
        }

        File.Move(temporaryPath, StatePath, overwrite: true);
    }

    public async Task<LocalImage> ImportImageAsync(Stream source, string fileName, string mimeType, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(UploadsPath);
        var extension = ExtensionsByMimeType.TryGetValue(mimeType, out var known) ? known : ".bin";
        var storedPath = Path.GetFullPath(Path.Combine(UploadsPath, $"{Guid.NewGuid():N}{extension}"));
        long size;
        await using (var destination = File.Create(storedPath))
        {
            await source.CopyToAsync(destination, cancellationToken).ConfigureAwait(false);
            size = destination.Length;
        }

        return new LocalImage(storedPath, fileName, mimeType, size);
    }

    public Task DeleteImageAsync(LocalImage image, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (File.Exists(image.StoredPath))
        {
            File.Delete(image.StoredPath);
        }

        return Task.CompletedTask;
    }

    private sealed record VisitorUploadDto(string ScreenId, string TileId, string StoredPath, string FileName, string MimeType, long Size);

    private sealed record VisitorStateDto(int SchemaVersion, List<VisitorUploadDto> Uploads, string OneLiner);

    [JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
    [JsonSerializable(typeof(VisitorStateDto))]
    private sealed partial class VisitorJsonContext : JsonSerializerContext
    {
    }
}
