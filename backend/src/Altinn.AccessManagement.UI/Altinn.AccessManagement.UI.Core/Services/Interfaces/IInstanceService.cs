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
        /// <param name="party">The party for which the delegation check is performed.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The delegation check result.</returns>
        Task<List<RightCheck>> DelegationCheck(Guid party, string resource, string instance);

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

        /// <summary>
        /// Delegates rights on a specific instance.
        /// </summary>
        /// <param name="party">The acting party performing the delegation.</param>
        /// <param name="to">The receiving party.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <param name="actionKeys">The right keys to delegate.</param>
        /// <returns>The backend response.</returns>
        Task<HttpResponseMessage> Delegate(Guid party, Guid to, string resource, string instance, List<string> actionKeys);

        /// <summary>
        /// Updates delegated rights on a specific instance.
        /// </summary>
        /// <param name="party">The acting party performing the update.</param>
        /// <param name="to">The receiving party.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <param name="actionKeys">The updated right keys.</param>
        /// <returns>The backend response.</returns>
        Task<HttpResponseMessage> UpdateInstanceAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys);
    }
}
