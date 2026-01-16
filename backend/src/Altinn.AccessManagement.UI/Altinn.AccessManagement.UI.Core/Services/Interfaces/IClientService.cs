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
        /// Gets the clients for the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of clients.</returns>
        Task<List<ClientDelegation>> GetClients(Guid party, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the agents for the specified party.
        /// </summary>
        /// <param name="party">The party uuid to query for.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of agents.</returns>
        Task<List<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default);

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
