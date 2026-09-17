using Altinn.AccessManagement.UI.Core.Models.AccessPackage;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Model representing a resource with its associated rights and permissions
/// </summary>
public class ResourceRightAM
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
