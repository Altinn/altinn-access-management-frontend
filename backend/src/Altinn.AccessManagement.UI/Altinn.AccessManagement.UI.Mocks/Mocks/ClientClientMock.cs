using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Common;
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
        /// <summary>
        /// Initializes a new instance of the <see cref="ClientClientMock"/> class.
        /// </summary>
        public ClientClientMock(
            HttpClient httpClient,
            ILogger<ClientClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
        }

        /// <inheritdoc />
        public Task<PaginatedResult<ClientDelegation>> GetClients(Guid party, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            List<ClientDelegation> clients =
            [
                CreateClient(
                    "ACME AS",
                    "123456789",
                    Guid.Parse("77777777-7777-7777-7777-777777777777"),
                    Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    "DAGL",
                    Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    "urn:altinn:accesspackage:demo",
                    Guid.Parse("33333333-3333-3333-3333-333333333333"))
            ];

            return Task.FromResult(PaginatedResult.Create(clients, null));
        }

        /// <inheritdoc />
        public Task<PaginatedResult<ClientDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            List<ClientDelegation> agents =
            [
                CreateClient(
                    "Agent Partner AS",
                    "987654321",
                    Guid.Parse("88888888-8888-8888-8888-888888888888"),
                    Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    "HADM",
                    Guid.Parse("55555555-5555-5555-5555-555555555555"),
                    "urn:altinn:accesspackage:agent",
                    Guid.Parse("66666666-6666-6666-6666-666666666666"))
            ];

            return Task.FromResult(PaginatedResult.Create(agents, null));
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

        private static ClientDelegation CreateClient(
            string name,
            string orgNumber,
            Guid clientId,
            Guid roleId,
            string roleCode,
            Guid packageId,
            string packageUrn,
            Guid areaId)
        {
            return new ClientDelegation
            {
                Client = new CompactEntity
                {
                    Id = clientId,
                    Name = name,
                    Type = "Organization",
                    Variant = "org",
                    OrganizationIdentifier = orgNumber,
                    PartyId = 500000,
                },
                Access =
                [
                    new ClientDelegation.RoleAccessPackages
                    {
                        Role = new CompactRole()
                        {
                            Id = roleId,
                            Code = roleCode,
                        },
                        Packages =
                        [
                            new CompactPackage()
                            {
                                Id = packageId,
                                Urn = packageUrn,
                                AreaId = areaId,
                            }
                        ]
                    }
                ]
            };
        }
    }
}
