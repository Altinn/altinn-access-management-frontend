namespace Altinn.AccessManagement.UI.Core.Models.Role;

/// <summary>
/// Assignment
/// </summary>
public class Assignment
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
    /// IsDelegable
    /// </summary>
    public bool IsDelegable { get; set; } //// TODO: REMOVE

    /// <summary>
    /// Role
    /// </summary>
    public Role Role { get; set; }
}