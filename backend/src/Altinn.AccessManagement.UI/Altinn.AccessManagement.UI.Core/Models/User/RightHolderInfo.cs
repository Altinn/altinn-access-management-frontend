namespace Altinn.AccessManagement.UI.Core.Models.User;

/// <summary>
/// Represents detailed information about a right holder relationship (assignment) between parties,
/// including delegation, roles, and facilitators. This model is aligned with the structure from the external API.
/// </summary>
public class RightHolderInfo
{
    /// <summary>
    /// Gets or sets the party that delegates the right (the assigner).
    /// </summary>
    public PartyInfo From { get; set; }

    /// <summary>
    /// Gets or sets the role information associated with the delegation.
    /// </summary>
    public RoleInfo Role { get; set; }

    /// <summary>
    /// Gets or sets the party that receives the right (the assignee).
    /// </summary>
    public PartyInfo To { get; set; }

    /// <summary>
    /// Gets or sets the facilitator party, if applicable.
    /// </summary>
    public PartyInfo Facilitator { get; set; }

    /// <summary>
    /// Gets or sets the role of the facilitator, if applicable.
    /// </summary>
    public RoleInfo FacilitatorRole { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for this right holder relationship.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the party delegating the right.
    /// </summary>
    public Guid FromId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the role being delegated.
    /// </summary>
    public Guid RoleId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the party receiving the right.
    /// </summary>
    public Guid ToId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the facilitator party, if applicable.
    /// </summary>
    public Guid? FacilitatorId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the facilitator's role, if applicable.
    /// </summary>
    public Guid? FacilitatorRoleId { get; set; }

    /// <summary>
    /// Gets or sets the source of the right holder relationship (e.g., system or registry).
    /// </summary>
    public string Source { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the relationship is direct.
    /// </summary>
    public bool IsDirect { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the relationship is with a parent party. 
    /// (e.g., a parent organization if this is a sub-unit).
    /// </summary>
    public bool IsParent { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the relationship is a role mapping.
    /// This indicates that the role is not directly assigned but is mapped from another role.
    /// </summary>
    public bool IsRoleMap { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the role is a key role.
    /// 
    /// </summary>
    public bool IsKeyRole { get; set; }
}
