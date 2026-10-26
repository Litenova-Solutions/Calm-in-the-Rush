namespace CalmInTheRush.Application.Visitors;

public sealed record PickedImage(string FileName, string MimeType, Func<CancellationToken, Task<Stream>> OpenAsync);
