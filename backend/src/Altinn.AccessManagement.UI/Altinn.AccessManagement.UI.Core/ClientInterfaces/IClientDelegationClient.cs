using System.Net.Http;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Connections;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client delegation API client.
    /// </summary>
    public interface IClientDelegationClient
    {
        /// <summary>
        /// Gets the clients that have delegated access from the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated result of clients.</returns>
        Task<PaginatedResult<ClientDelegation>> GetClients(Guid party, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the agents that can act on behalf of the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated result of agents.</returns>
        Task<PaginatedResult<ClientDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds a new agent for the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="to">The agent party uuid.</param>
        /// <param name="personInput">Person input for lookup.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created assignment.</returns>
        Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes an agent for the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="to">The agent party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets delegated access packages to agents via a party.
        /// </summary>
        Task<HttpResponseMessage> GetDelegatedAccessPackagesToAgentsViaParty(Guid party, Guid to, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets delegated access packages from clients via a party.
        /// </summary>
        Task<HttpResponseMessage> GetDelegatedAccessPackagesFromClientsViaParty(Guid party, Guid from, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds an agent access package.
        /// </summary>
        Task<HttpResponseMessage> AddAgentAccessPackage(Guid party, Guid from, Guid to, Guid? packageId, string package, CancellationToken cancellationToken = default);

        /// <summary>
        /// Deletes an agent access package.
        /// </summary>
        Task<HttpResponseMessage> DeleteAgentAccessPackage(Guid party, Guid from, Guid to, Guid? packageId, string package, CancellationToken cancellationToken = default);
    }
}
