using Altinn.AccessManagement.UI.Core.Models.AccessPackage;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Model representing a resource with its associated rights and permissions
/// </summary>
public class ResourceRight
{
    /// <summary>
    /// The resource
    /// </summary>
    public required ResourceAM Resource { get; set; }

    /// <summary>
    /// List of direct rights and associated permissions for the resource
    /// </summary>
    public required List<RightAccess> DirectRights { get; set; }

    /// <summary>
    /// List of indirect rights and associated permissions for the resource
    /// </summary>
    public required List<RightAccess> IndirectRights { get; set; }
}

/// <summary>
/// Model representing a right item with its right definition, reason and permissions
/// </summary>
public class RightAccess
{
    /// <summary>
    /// The right definition
    /// </summary>
    public required Right Right { get; set; }

    /// <summary>
    /// Reason for the right
    /// </summary>
    public Reason Reason { get; set; }

    /// <summary>
    /// List of permissions associated with the right
    /// </summary>
    public List<Permission> Permissions { get; set; }
}
