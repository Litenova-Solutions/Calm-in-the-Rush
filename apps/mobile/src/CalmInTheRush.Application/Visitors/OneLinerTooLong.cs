namespace CalmInTheRush.Application.Visitors;

public sealed record OneLinerTooLong(int MaxLength) : SaveOneLinerResult;
