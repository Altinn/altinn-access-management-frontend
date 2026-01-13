using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the client delegation API.
    /// </summary>
    public class ClientService : IClientService
    {
        private readonly IClientDelegationClient _clientDelegationClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientService"/> class.
        /// </summary>
        /// <param name="clientDelegationClient">Client delegation client.</param>
        public ClientService(
            IClientDelegationClient clientDelegationClient)
        {
            _clientDelegationClient = clientDelegationClient;
        }

        /// <inheritdoc />
        public async Task<List<ClientDelegation>> GetClients(Guid party, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.GetClients(party, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<List<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.GetAgents(party, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.AddAgent(party, to, personInput, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            await _clientDelegationClient.RemoveAgent(party, to, cancellationToken);
        }
    }
}
