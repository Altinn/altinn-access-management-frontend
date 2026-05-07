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
        public Task<Guid> ValidateCredentials(Altinn2UserRequest request, CancellationToken cancellationToken)
        {
            if (request?.Username == "invalid" || request?.Password == "invalid")
            {
                throw new HttpStatusException("Unauthorized", "Invalid credentials", HttpStatusCode.Unauthorized, null);
            }

            return Task.FromResult(_mockPartyUuid);
        }
    }
}
