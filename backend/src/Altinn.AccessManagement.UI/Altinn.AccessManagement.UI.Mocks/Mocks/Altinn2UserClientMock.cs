using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Altinn2User;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IAltinn2UserClient"/>.
    /// </summary>
    public class Altinn2UserClientMock : IAltinn2UserClient
    {
        /// <inheritdoc />
        public Task<HttpResponseMessage> AddAltinn2User(Altinn2UserRequest request)
        {
            if (!string.IsNullOrEmpty(request?.Username) && !string.IsNullOrEmpty(request?.Password))
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
        }
    }
}


