using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class Altinn2UserService : IAltinn2UserService
    {
        private readonly IAltinn2UserClient _altinn2UserClient;
        private readonly IConnectionClient _connectionClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="Altinn2UserService"/> class.
        /// </summary>
        public Altinn2UserService(IAltinn2UserClient altinn2UserClient, IConnectionClient connectionClient)
        {
            _altinn2UserClient = altinn2UserClient;
            _connectionClient = connectionClient;
        }

        /// <inheritdoc />
        public async Task<Result<bool>> AddAltinn2User(Altinn2UserRequest request, CancellationToken cancellationToken)
        {
            // first, check if the provided credentials are valid for an Altinn 2 user account
            Result<bool> response = await _altinn2UserClient.VerifyAltinn2User(request, cancellationToken);
            if (response.IsProblem)
            {
                return response.Problem;
            }

            // if credentials are valid, call AM to create the Altinn 2 user
            Guid newUserGuid = await _connectionClient.PostNewSelfIdentifiedUser(Guid.Empty, Guid.Empty, cancellationToken);

            return true;
        }
    }
}
