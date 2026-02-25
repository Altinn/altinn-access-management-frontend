using Altinn.AccessManagement.UI.Core.Models.AccessPackage;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Delegation check model for a resource
/// </summary>
public class ResourceCheckDto
{
    /// <summary>
    /// Resource the delegation check is regarding
    /// </summary>
    public required ResourceAM Resource { get; set; }

    /// <summary>
    /// Rights describing which accesses are available on the service and if they are delegable to the user.
    /// </summary>
    public required IEnumerable<RightCheck> Rights { get; set; }
}