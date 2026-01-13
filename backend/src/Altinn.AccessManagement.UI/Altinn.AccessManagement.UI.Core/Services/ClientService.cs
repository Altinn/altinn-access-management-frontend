using System.Collections.Generic;
using System.Net.Http;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Common;
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
        private readonly ILogger _logger;
        private readonly IClientDelegationClient _clientDelegationClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientService"/> class.
        /// </summary>
        /// <param name="logger">Logger instance.</param>
        /// <param name="clientDelegationClient">Client delegation client.</param>
        public ClientService(
            ILogger<ClientService> logger,
            IClientDelegationClient clientDelegationClient)
        {
            _logger = logger;
            _clientDelegationClient = clientDelegationClient;
        }

        /// <inheritdoc />
        public async Task<List<ClientDelegation>> GetClients(Guid party, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _clientDelegationClient.GetClients(party, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed fetching clients for {Party}", party);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _clientDelegationClient.GetAgents(party, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed fetching agents for {Party}", party);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _clientDelegationClient.AddAgent(party, to, personInput, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed adding agent for {Party}", party);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            try
            {
                await _clientDelegationClient.RemoveAgent(party, to, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed removing agent for {Party}", party);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> GetDelegatedAccessPackagesToAgentsViaParty(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _clientDelegationClient.GetDelegatedAccessPackagesToAgentsViaParty(party, to, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed fetching agent access packages for {Party}", party);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> GetDelegatedAccessPackagesFromClientsViaParty(Guid party, Guid from, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _clientDelegationClient.GetDelegatedAccessPackagesFromClientsViaParty(party, from, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed fetching client access packages for {Party}", party);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> AddAgentAccessPackage(Guid party, Guid from, Guid to, Guid? packageId, string package, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _clientDelegationClient.AddAgentAccessPackage(party, from, to, packageId, package, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed adding agent access package for {Party}", party);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> DeleteAgentAccessPackage(Guid party, Guid from, Guid to, Guid? packageId, string package, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _clientDelegationClient.DeleteAgentAccessPackage(party, from, to, packageId, package, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed deleting agent access package for {Party}", party);
                throw;
            }
        }
    }
}
