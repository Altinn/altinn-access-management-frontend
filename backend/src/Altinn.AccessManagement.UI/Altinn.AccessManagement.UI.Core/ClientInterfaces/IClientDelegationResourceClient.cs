using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for the single rights resource endpoints of the client delegation API.
    /// These endpoints only exist in v2, so this interface is deliberately kept separate from
    /// <see cref="IClientDelegationClient"/> — v1 has no counterpart to implement, and the
    /// callers only reach these endpoints with the UseNewSingleRightsClientDelegation flag on.
    /// </summary>
    public interface IClientDelegationResourceClient
    {
        /// <summary>
        /// Gets the resources delegated to an agent, grouped by client.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="to">The agent party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of clients with their delegated resources.</returns>
        Task<IEnumerable<ClientDelegation>> GetAgentResources(Guid party, Guid to, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the resources delegated from a client, grouped by agent.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="from">The client party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of agents with their delegated resources.</returns>
        Task<IEnumerable<AgentDelegation>> GetClientResources(Guid party, Guid from, CancellationToken cancellationToken = default);

        /// <summary>
        /// Delegates resources from a client to an agent.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="from">The client party uuid.</param>
        /// <param name="to">The agent party uuid.</param>
        /// <param name="payload">Resource delegation payload, holding resource registry ids.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The resulting resource delegations.</returns>
        Task<List<ResourceDelegationDto>> AddAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes delegated resources from an agent.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="from">The client party uuid.</param>
        /// <param name="to">The agent party uuid.</param>
        /// <param name="payload">Resource delegation payload, holding resource registry ids.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes delegated resources for the authenticated user from a specific client via a provider.
        /// </summary>
        /// <param name="provider">The provider party uuid.</param>
        /// <param name="from">The client party uuid.</param>
        /// <param name="payload">Resource delegation payload, holding resource registry ids.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveMyClientResources(Guid provider, Guid from, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default);
    }
}
