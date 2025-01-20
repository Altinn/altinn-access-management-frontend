namespace Altinn.AccessManagement.UI.Core.Models.Role;

/// <summary>
/// Assignment
/// </summary>
public class RoleAssignment
{
    /// <summary>
    /// Id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// RoleId
    /// </summary>
    public Guid RoleId { get; set; }

    /// <summary>
    /// FromId
    /// </summary>
    public Guid FromId { get; set; }

    /// <summary>
    /// ToId
    /// </summary>
    public Guid ToId { get; set; }

    /// <summary>
    /// Role
    /// </summary>
    public Role Role { get; set; }

}