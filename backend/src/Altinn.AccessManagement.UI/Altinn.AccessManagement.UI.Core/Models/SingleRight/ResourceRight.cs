using Altinn.AccessManagement.UI.Core.Models.AccessPackage;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Model representing a resource with its associated permissions
/// </summary>
public class ResourceRight
{
    /// <summary>
    /// The resource
    /// </summary>
    public required ResourceAM Resource { get; set; }

    /// <summary>
    /// List of rights and associated permissions for the resource
    /// </summary>
    public required List<RightPermission> Rules { get; set; }
}
