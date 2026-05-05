using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SelfIdentifiedUserService : ISelfIdentifiedUserService
    {
        private readonly IAltinn2UserClient _altinn2UserClient;
        private readonly IConnectionClient _connectionClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SelfIdentifiedUserService"/> class.
        /// </summary>
        public SelfIdentifiedUserService(IAltinn2UserClient altinn2UserClient, IConnectionClient connectionClient)
        {
            _altinn2UserClient = altinn2UserClient;
            _connectionClient = connectionClient;
        }

        /// <inheritdoc />
        public async Task<Result<bool>> AddAltinn2User(Guid to, Altinn2UserRequest request, CancellationToken cancellationToken)
        {
            // first, check if the provided credentials are valid for an Altinn 2 user account
            Result<bool> response = await _altinn2UserClient.VerifyAltinn2User(request, cancellationToken);
            if (response.IsProblem)
            {
                return response.Problem;
            }

            // if credentials are valid, call AM to create the Altinn 2 user
            AssignmentDto assignment = await _connectionClient.PostNewSelfIdentifiedUser(from: Guid.Empty, to: to, cancellationToken);

            return true;
        }
    }
}
