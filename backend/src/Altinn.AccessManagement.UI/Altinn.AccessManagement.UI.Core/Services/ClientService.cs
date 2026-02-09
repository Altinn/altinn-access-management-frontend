using System.Linq;
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
        public async Task<List<ClientDelegation>> GetClients(Guid party, List<string> roles = null, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.GetClients(party, roles, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<List<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.GetAgents(party, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<List<ClientDelegation>> GetAgentAccessPackages(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.GetAgentAccessPackages(party, to, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<List<AgentDelegation>> GetClientAccessPackages(Guid party, Guid from, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.GetClientAccessPackages(party, from, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<List<DelegationDto>> AddAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.AddAgentAccessPackages(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            await _clientDelegationClient.RemoveAgentAccessPackages(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            if (personInput != null)
            {
                if (string.IsNullOrWhiteSpace(personInput.PersonIdentifier) || string.IsNullOrWhiteSpace(personInput.LastName))
                {
                    throw new ArgumentException("PersonInput requires both personIdentifier and lastName.");
                }

                string personIdentifierCleaned = personInput.PersonIdentifier.Trim().Replace("\"", string.Empty);
                string lastnameCleaned = personInput.LastName.Trim().Replace("\"", string.Empty);

                if (IsDigitsOnly(personIdentifierCleaned) && !IsValidSsn(personIdentifierCleaned))
                {
                    throw new ArgumentException("Invalid person identifier format");
                }

                PersonInput cleanedInput = new PersonInput
                {
                    LastName = lastnameCleaned,
                    PersonIdentifier = personIdentifierCleaned,
                };

                return await _clientDelegationClient.AddAgent(party, to, cleanedInput, cancellationToken);
            }

            return await _clientDelegationClient.AddAgent(party, to, null, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            await _clientDelegationClient.RemoveAgent(party, to, cancellationToken);
        }

        private static bool IsValidSsn(string personIdentifier)
        {
            return personIdentifier.Length == 11 && personIdentifier.All(char.IsDigit);
        }

        private static bool IsDigitsOnly(string personIdentifier)
        {
            return !string.IsNullOrEmpty(personIdentifier) && personIdentifier.All(char.IsDigit);
        }
    }
}
