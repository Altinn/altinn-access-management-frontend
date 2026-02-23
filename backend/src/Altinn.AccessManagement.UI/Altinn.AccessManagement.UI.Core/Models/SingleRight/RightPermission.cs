using Altinn.AccessManagement.UI.Core.Models.AccessPackage;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Model representing a right/permission for a resource, used in the context of single rights and delegations
/// </summary>
public class RightPermission
{
    /// <summary>
    /// The actionKey/rightKey that uniquely identifies the right
    /// </summary>
    public required string Key { get; set; }

    /// <summary>
    /// The subresource within the resource that the action belongs to
    /// </summary>
    public required string SubResource { get; set; }

    /// <summary>
    /// The action that the right represents, e.g. "read", "write", "delete" etc.
    /// </summary>
    public required string Action { get; set; }

    /// <summary>
    /// List of permissions associated with the right
    /// </summary>
    public required List<Permission> Permissions { get; set; }
}
