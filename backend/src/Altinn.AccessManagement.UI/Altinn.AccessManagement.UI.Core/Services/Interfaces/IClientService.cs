using System.Collections.Generic;
using System.Net.Http;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Connections;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for client operations.
    /// </summary>
    public interface IClientService
    {
        /// <summary>
        /// Gets clients delegated to the authenticated user, optionally filtered by provider(s).
        /// </summary>
        /// <param name="provider">Optional provider party uuids.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of providers and their delegated clients.</returns>
        Task<List<MyClientDelegation>> GetMyClients(List<Guid> provider = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes a provider relationship for the authenticated user, including delegated client access.
        /// </summary>
        /// <param name="provider">The provider party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveMyClientProvider(Guid provider, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes delegated access packages for the authenticated user from a specific client via a provider.
        /// </summary>
        /// <param name="provider">The provider party uuid.</param>
        /// <param name="from">The client party uuid.</param>
        /// <param name="payload">Delegation payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveMyClientAccessPackages(Guid provider, Guid from, DelegationBatchInputDto payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the clients for the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="roles">Optional list of role identifiers to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of clients.</returns>
        Task<List<ClientDelegation>> GetClients(Guid party, List<string> roles = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the agents for the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of agents.</returns>
        Task<List<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the access packages delegated to an agent via the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="to">The agent party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of clients with delegated access packages.</returns>
        Task<List<ClientDelegation>> GetAgentAccessPackages(Guid party, Guid to, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the access packages delegated from a client via the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="from">The client party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of agents with delegated access packages.</returns>
        Task<List<AgentDelegation>> GetClientAccessPackages(Guid party, Guid from, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds access packages for an agent via the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="from">The client party uuid.</param>
        /// <param name="to">The agent party uuid.</param>
        /// <param name="payload">Delegation payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of delegated access packages.</returns>
        Task<List<DelegationDto>> AddAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes access packages for an agent via the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="from">The client party uuid.</param>
        /// <param name="to">The agent party uuid.</param>
        /// <param name="payload">Delegation payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default);

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
    }
}
