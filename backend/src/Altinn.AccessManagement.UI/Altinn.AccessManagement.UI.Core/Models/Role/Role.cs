namespace Altinn.AccessManagement.UI.Core.Models.Role;

/// <summary>
/// Entity representing a Role
/// </summary>
public class Role
{
    /// <summary>
    /// Id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name
    /// e.g Dagligleder
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Code
    /// e.g DAGL
    /// </summary>
    public string Code { get; set; }

    /// <summary>
    /// Description
    /// e.g The main operator of the organization
    /// </summary>
    public string Description { get; set; }

    /// <summary>
    /// URN
    /// </summary>
    public string Urn { get; set; }

    /// <summary>
    /// Area
    /// </summary>
    public RoleArea Area { get; set; }

    /// <summary>
    ///  ProviderId
    /// </summary>
    public Guid ProviderId { get; set; }

    /// <summary>
    /// IsDelegable
    /// </summary>
    public bool IsDelegable { get; set; }

    /// <summary>
    /// Defines the role as a KeyRole
    /// </summary>
    public bool IsKeyRole { get; set; }
}