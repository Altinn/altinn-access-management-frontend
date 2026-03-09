using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for instance delegation logic.
    /// </summary>
    public interface IInstanceService
    {
        /// <summary>
        /// Gets delegated instances for the specified parties.
        /// </summary>
        /// <param name="languageCode">The language to use for resource texts.</param>
        /// <param name="party">The acting party asking for the delegations.</param>
        /// <param name="from">The party the instance access was delegated from.</param>
        /// <param name="to">The party the instance access was delegated to.</param>
        /// <param name="resource">Optional resource identifier filter.</param>
        /// <param name="instance">Optional instance urn filter.</param>
        /// <returns>A list of delegated instances.</returns>
        Task<List<InstanceDelegation>> GetInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance);

        /// <summary>
        /// Gets the rights a user can delegate on a specific instance.
        /// </summary>
        /// <param name="from">The party from which the instance would be delegated.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The delegation check result.</returns>
        Task<List<RightCheck>> DelegationCheck(Guid from, string resource, string instance);

        /// <summary>
        /// Gets rights for a delegated instance.
        /// </summary>
        /// <param name="languageCode">The language to use for the request.</param>
        /// <param name="party">The acting party asking for the rights.</param>
        /// <param name="from">The party the instance access was delegated from.</param>
        /// <param name="to">The party the instance access was delegated to.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The delegated instance rights.</returns>
        Task<InstanceRight> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance);
    }
}
