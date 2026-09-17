using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// The rights a party has on a resource, as it is served to the frontend
/// </summary>
public class ResourceRight
{
    /// <summary>
    /// The resource
    /// </summary>
    public required ServiceResourceFE Resource { get; set; }

    /// <summary>
    /// Rights delegated directly to the party
    /// </summary>
    public required List<RightAccess> DirectRights { get; set; }

    /// <summary>
    /// Rights the party has through something else
    /// </summary>
    public required List<RightAccess> IndirectRights { get; set; }

    /// <summary>
    /// Maps access management resource rights to the frontend model.
    /// </summary>
    /// <param name="rights">The upstream resource rights</param>
    /// <param name="orgs">Organization data from the Altinn CDN. Used to look up the service owner logo</param>
    /// <returns>The frontend model</returns>
    public static ResourceRight FromAm(ResourceRightAM rights, IReadOnlyDictionary<string, OrgData> orgs)
    {
        return new ResourceRight
        {
            Resource = ResourceUtils.MapToResourceFE(rights.Resource, orgs),
            DirectRights = rights.DirectRights,
            IndirectRights = rights.IndirectRights,
        };
    }
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
