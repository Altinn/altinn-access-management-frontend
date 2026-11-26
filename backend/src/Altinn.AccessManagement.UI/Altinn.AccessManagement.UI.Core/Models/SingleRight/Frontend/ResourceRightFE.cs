using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.Frontend
{
    /// <summary>
    /// A resource with the rights delegated on it, as sent to the frontend
    /// </summary>
    public class ResourceRightFE
    {
        /// <summary>
        /// Gets or sets the resource
        /// </summary>
        public ServiceResourceFE Resource { get; set; }

        /// <summary>
        /// Gets or sets the direct rights for the resource
        /// </summary>
        public List<RightAccessFE> DirectRights { get; set; } = new();

        /// <summary>
        /// Gets or sets the indirect rights for the resource
        /// </summary>
        public List<RightAccessFE> IndirectRights { get; set; } = new();

        /// <summary>
        /// Maps a resource right from the access management rights endpoints
        /// </summary>
        /// <param name="resourceRight">The resource right from Access Management</param>
        /// <param name="resource">The resource, already mapped to the frontend model</param>
        public static ResourceRightFE FromResourceRight(ResourceRight resourceRight, ServiceResourceFE resource)
        {
            if (resourceRight == null)
            {
                return null;
            }

            return new ResourceRightFE
            {
                Resource = resource,
                DirectRights = RightAccessFE.FromRightAccesses(resourceRight.DirectRights),
                IndirectRights = RightAccessFE.FromRightAccesses(resourceRight.IndirectRights),
            };
        }
    }
}
