using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="ISelfIdentifiedUserClient"/>.
    /// </summary>
    public class SelfIdentifiedUserClientMock : ISelfIdentifiedUserClient
    {
        private static readonly Guid _mockPartyUuid = Guid.Parse("00000000-0000-0000-0000-000000000001");

        /// <inheritdoc />
        public Task<Guid> AddAltinn2Account(Altinn2AccountRequest request, CancellationToken cancellationToken)
        {
            if (request?.UserName == "invalid" || request?.Password == "invalid")
            {
                throw new HttpStatusException("Unauthorized", "Invalid credentials", HttpStatusCode.Unauthorized, null);
            }

            return Task.FromResult(_mockPartyUuid);
        }

        /// <inheritdoc />
        public Task<Guid> AddAltinn2AccountFromToken(Altinn2AccountFromTokenRequest request, CancellationToken cancellationToken)
        {
            if (request?.Token == "invalid")
            {
                throw new HttpStatusException("Unauthorized", "Invalid token", HttpStatusCode.Unauthorized, null);
            }

            return Task.FromResult(_mockPartyUuid);
        }

        /// <inheritdoc />
        public Task<Altinn2ForgotPasswordResponse> SendForgotPasswordEmail(Altinn2ForgotPasswordRequest request, CancellationToken cancellationToken)
        {
            if (request?.UserName == "invalid")
            {
                throw new HttpStatusException("Unauthorized", "User not found", HttpStatusCode.Unauthorized, null);
            }

            return Task.FromResult(new Altinn2ForgotPasswordResponse() { MaskedEmail = "t******`@e`******.com" });
        }
    }
}
