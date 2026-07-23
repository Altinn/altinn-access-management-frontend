using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.IdPortenAuthorization;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Register.Contracts.V1;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class IdPortenAuthorizationService : IIdPortenAuthorizationService
    {
        private readonly IIdPortenAuthorizationClient _idPortenAuthorizationClient;

        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="IdPortenAuthorizationService"/> class.
        /// </summary>
        /// <param name="idPortenAuthorizationClient">The ID-porten authorization client.</param>
        /// <param name="registerClient">The register client.</param>
        public IdPortenAuthorizationService(IIdPortenAuthorizationClient idPortenAuthorizationClient, IRegisterClient registerClient)
        {
            _idPortenAuthorizationClient = idPortenAuthorizationClient;
            _registerClient = registerClient;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<IdPortenAuthorizationFE>> GetIdPortenAuthorizations(CancellationToken cancellationToken)
        {
            IEnumerable<IdPortenAuthorization> response = await _idPortenAuthorizationClient.GetIdPortenAuthorizations(cancellationToken);
            List<IdPortenAuthorizationFE> authorizationFEs = [];

            foreach (var auth in response)
            {
                // Return party name for the organization number in the consumer of the authorization
                Party party = await _registerClient.GetPartyForOrganization(auth.Consumer.OrgNo);

                IdPortenAuthorizationFE authorization = new()
                {
                    AuthorizationId = auth.Authorization_id,
                    AuthorizedAt = auth.Authorized_at,
                    ClientId = auth.Client_id,
                    ClientName = auth.Client_name,
                    Expires = auth.Expires,
                    UserAgent = auth.User_agent,
                    ConsumerName = party != null ? party.Name : "Unknown consumer",
                    ConsumerPartyUuid = party != null ? $"urn:altinn:party:uuid:{party.PartyUuid}" : string.Empty,
                    Scopes = auth.Scopes.Select((scope) =>
                    {
                        return new ScopeFE()
                        {
                            Name = scope.Name,
                            Description = scope.Description,
                            LongDescription = MarkdownConverter.ConvertToHtml(scope.Long_description) // Convert long description from markdown to html
                        };
                    })
                };
                authorizationFEs.Add(authorization);
            }

            return authorizationFEs;
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawIdPortenAuthorization(string id, CancellationToken cancellationToken)
        {
            return await _idPortenAuthorizationClient.WithdrawIdPortenAuthorization(id, cancellationToken);
        }
    }
}