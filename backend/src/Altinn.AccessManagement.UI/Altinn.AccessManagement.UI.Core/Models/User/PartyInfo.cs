namespace Altinn.AccessManagement.UI.Core.Models.User;

/// <summary>
/// Represents a party involved in a delegation (From, To, Facilitator).
/// Contains identifying and descriptive information about the party.
/// </summary>
public class PartyInfo
{
    /// <summary>
    /// Gets or sets the unique identifier for the party.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the type identifier for the party (e.g., person, organization).
    /// </summary>
    public Guid TypeId { get; set; }

    /// <summary>
    /// Gets or sets the variant identifier for the party (used for further categorization).
    /// </summary>
    public Guid VariantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the party.
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the parent party's unique identifier, if applicable.
    /// </summary>
    public Guid? ParentId { get; set; }
}
