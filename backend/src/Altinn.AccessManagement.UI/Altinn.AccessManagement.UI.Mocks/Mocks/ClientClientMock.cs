using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IClientDelegationClient"/> interface.
    /// </summary>
    public class ClientClientMock : IClientDelegationClient
    {
        private readonly string dataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientClientMock"/> class.
        /// </summary>
        public ClientClientMock(
            HttpClient httpClient,
            ILogger<ClientClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<List<ClientDelegation>> GetClients(Guid party, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "ClientDelegation", "clients.json");
            return Task.FromResult(Util.GetMockData<List<ClientDelegation>>(dataPath));
        }

        /// <inheritdoc />
        public Task<List<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "ClientDelegation", "agents.json");
            return Task.FromResult(Util.GetMockData<List<AgentDelegation>>(dataPath));
        }

        /// <inheritdoc />
        public Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            return Task.FromResult(new AssignmentDto
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
                RoleId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                FromId = party,
                ToId = to ?? Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            });
        }

        /// <inheritdoc />
        public Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.CompletedTask;
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> GetDelegatedAccessPackagesToAgentsViaParty(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotImplemented));
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> GetDelegatedAccessPackagesFromClientsViaParty(Guid party, Guid from, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotImplemented));
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> AddAgentAccessPackage(Guid party, Guid from, Guid to, Guid? packageId, string package, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotImplemented));
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> DeleteAgentAccessPackage(Guid party, Guid from, Guid to, Guid? packageId, string package, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotImplemented));
        }

    }
}
