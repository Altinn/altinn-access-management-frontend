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
        public async Task<IEnumerable<IdPortenAuthorization>> GetIdPortenAuthorizations(CancellationToken cancellationToken)
        {
            IEnumerable<IdPortenAuthorization> response = await _idPortenAuthorizationClient.GetIdPortenAuthorizations(cancellationToken);
            foreach (var auth in response)
            {
                foreach (var scope in auth.Scopes)
                {
                    // Convert long description from markdown to html
                    scope.Long_description = MarkdownConverter.ConvertToHtml(scope.Long_description);
                }

                // Return party name for the organization number in the consumer of the authorization
                Party party = await _registerClient.GetPartyForOrganization(auth.Consumer.OrgNo);
                auth.Consumer.OrgName = party.Name;
            }

            return response;
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawIdPortenAuthorization(string id, CancellationToken cancellationToken)
        {
            return await _idPortenAuthorizationClient.WithdrawIdPortenAuthorization(id, cancellationToken);
        }
    }
}