using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SelfIdentifiedUserService : ISelfIdentifiedUserService
    {
        private readonly ISelfIdentifiedUserClient _selfIdentifiedUserClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SelfIdentifiedUserService"/> class.
        /// </summary>
        public SelfIdentifiedUserService(ISelfIdentifiedUserClient selfIdentifiedUserClient)
        {
            _selfIdentifiedUserClient = selfIdentifiedUserClient;
        }

        /// <inheritdoc />
        public async Task<Guid> AddAltinn2Account(Altinn2AccountRequest request, CancellationToken cancellationToken)
        {
            return await _selfIdentifiedUserClient.AddAltinn2Account(request, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Altinn2ForgotPasswordResponse> SendForgotPasswordEmail(Altinn2ForgotPasswordRequest request, CancellationToken cancellationToken)
        {
            return await _selfIdentifiedUserClient.SendForgotPasswordEmail(request, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Guid> AddAltinn2AccountFromToken(Altinn2AccountFromTokenRequest request, CancellationToken cancellationToken)
        {
            return await _selfIdentifiedUserClient.AddAltinn2AccountFromToken(request, cancellationToken);
        }
    }
}
