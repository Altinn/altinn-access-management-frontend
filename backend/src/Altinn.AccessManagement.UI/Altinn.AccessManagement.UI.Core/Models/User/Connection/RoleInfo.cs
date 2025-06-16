namespace Altinn.AccessManagement.UI.Core.Models.User;

/// <summary>
/// Represents a role involved in a delegation, including identifiers, descriptive information, and metadata.
/// </summary>
public class RoleInfo
{
    /// <summary>
    /// Gets or sets the unique identifier for the role.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the entity type associated with the role.
    /// </summary>
    public Guid? EntityTypeId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the provider of the role.
    /// </summary>
    public Guid ProviderId { get; set; }

    /// <summary>
    /// Gets or sets the name of the role.
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the code representing the role.
    /// </summary>
    public string Code { get; set; }

    /// <summary>
    /// Gets or sets the description of the role.
    /// </summary>
    public string Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the role is a key role.
    /// </summary>
    public bool IsKeyRole { get; set; }

    /// <summary>
    /// Gets or sets the Uniform Resource Name (URN) for the role.
    /// </summary>
    public string Urn { get; set; }
}
