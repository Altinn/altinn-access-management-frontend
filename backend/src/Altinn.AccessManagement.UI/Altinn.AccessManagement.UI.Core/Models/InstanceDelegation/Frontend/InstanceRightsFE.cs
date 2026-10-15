using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend
{
    /// <summary>
    /// An instance with the rights delegated on it, as sent to the frontend
    /// </summary>
    public class InstanceRightsFE
    {
        /// <summary>
        /// Gets or sets the resource
        /// </summary>
        public ResourceAM Resource { get; set; }

        /// <summary>
        /// Gets or sets the delegated instance
        /// </summary>
        public DelegationInstance Instance { get; set; }

        /// <summary>
        /// Gets or sets the direct rights for the instance
        /// </summary>
        public List<RightAccessFE> DirectRights { get; set; } = new();

        /// <summary>
        /// Gets or sets the indirect rights for the instance
        /// </summary>
        public List<RightAccessFE> IndirectRights { get; set; } = new();

        /// <summary>
        /// Maps instance rights from the access management instance endpoints
        /// </summary>
        public static InstanceRightsFE FromInstanceRights(InstanceRights instanceRights)
        {
            if (instanceRights == null)
            {
                return null;
            }

            return new InstanceRightsFE
            {
                Resource = instanceRights.Resource,
                Instance = instanceRights.Instance,
                DirectRights = RightAccessFE.FromRightAccesses(instanceRights.DirectRights),
                IndirectRights = RightAccessFE.FromRightAccesses(instanceRights.IndirectRights),
            };
        }
    }
}
