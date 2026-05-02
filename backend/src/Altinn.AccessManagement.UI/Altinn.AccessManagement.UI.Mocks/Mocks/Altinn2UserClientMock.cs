using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IAltinn2UserClient"/>.
    /// </summary>
    public class Altinn2UserClientMock : IAltinn2UserClient
    {
        /// <inheritdoc />
        public Task<Result<bool>> VerifyAltinn2User(Altinn2UserRequest request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrEmpty(request?.Username) && !string.IsNullOrEmpty(request?.Password))
                return Task.FromResult(new Result<bool>(true));

            return Task.FromResult(new Result<bool>(false));
        }
    }
}


