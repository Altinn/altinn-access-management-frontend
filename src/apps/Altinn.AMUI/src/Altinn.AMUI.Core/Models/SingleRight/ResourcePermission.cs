using Altinn.AMUI.Core.Models.AccessPackage;

namespace Altinn.AMUI.Core.Models.SingleRight;

/// <summary>
/// Model representing a resource with its associated permissions
/// </summary>
public class ResourcePermission
{
    /// <summary>
    /// The resource
    /// </summary>
    public required ResourceAM Resource { get; set; }

    /// <summary>
    /// List of permissions associated with the resource
    /// </summary>
    public required List<Permission> Permissions { get; set; }
}
