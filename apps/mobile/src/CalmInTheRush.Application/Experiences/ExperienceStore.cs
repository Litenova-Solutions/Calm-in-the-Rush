using CalmInTheRush.Domain.Experiences;
using CalmInTheRush.Domain.Visitors;

namespace CalmInTheRush.Application.Experiences;

public sealed class ExperienceStore
{
    public ExperienceStore(Experience experience, VisitorState visitor)
    {
        Experience = experience;
        Visitor = visitor;
    }

    public Experience Experience { get; }

    public VisitorState Visitor { get; private set; }

    public event EventHandler? Changed;

    public void Apply(VisitorState visitor)
    {
        Visitor = visitor;
        Changed?.Invoke(this, EventArgs.Empty);
    }
}
