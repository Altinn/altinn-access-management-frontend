using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.Models.InstanceDelegation
{
    /// <summary>
    /// The rights a party has on an instance, as it is served to the frontend
    /// </summary>
    public class InstanceRights
    {
        /// <summary>
        /// The resource the instance belongs to
        /// </summary>
        public required ServiceResourceFE Resource { get; set; }

        /// <summary>
        /// The instance
        /// </summary>
        public required DelegationInstance Instance { get; set; }

        /// <summary>
        /// Rights delegated directly to the party
        /// </summary>
        public required List<RightAccess> DirectRights { get; set; }

        /// <summary>
        /// Rights the party has through something else
        /// </summary>
        public required List<RightAccess> IndirectRights { get; set; }

        /// <summary>
        /// Maps access management instance rights to the frontend model.
        /// </summary>
        /// <param name="rights">The upstream instance rights</param>
        /// <param name="orgs">Organization data from the Altinn CDN. Used to look up the service owner logo</param>
        /// <returns>The frontend model</returns>
        public static InstanceRights FromAm(InstanceRightsAM rights, IReadOnlyDictionary<string, OrgData> orgs)
        {
            return new InstanceRights
            {
                Resource = ResourceUtils.MapToResourceFE(rights.Resource, orgs),
                Instance = rights.Instance,
                DirectRights = rights.DirectRights,
                IndirectRights = rights.IndirectRights,
            };
        }
    }
}
