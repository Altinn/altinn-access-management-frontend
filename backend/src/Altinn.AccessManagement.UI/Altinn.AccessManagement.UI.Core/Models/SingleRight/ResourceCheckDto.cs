using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Delegation check model for a resource, as it is served to the frontend
/// </summary>
public class ResourceCheckDto
{
    /// <summary>
    /// Resource the delegation check is regarding
    /// </summary>
    public required ServiceResourceFE Resource { get; set; }

    /// <summary>
    /// Rights describing which accesses are available on the service and if they are delegable to the user.
    /// </summary>
    public required IEnumerable<RightCheck> Rights { get; set; }

    /// <summary>
    /// Maps an access management delegation check result to the frontend model.
    /// </summary>
    /// <param name="check">The upstream delegation check result</param>
    /// <param name="orgs">Organization data from the Altinn CDN. Used to look up the service owner logo</param>
    /// <returns>The frontend model</returns>
    public static ResourceCheckDto FromAm(ResourceCheckAM check, IReadOnlyDictionary<string, OrgData> orgs)
    {
        return new ResourceCheckDto
        {
            Resource = ResourceUtils.MapToResourceFE(check.Resource, orgs),
            Rights = check.Rights,
        };
    }
}
