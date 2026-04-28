using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class Altinn2UserService : IAltinn2UserService
    {
        private readonly IAltinn2UserClient _altinn2UserClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="Altinn2UserService"/> class.
        /// </summary>
        public Altinn2UserService(IAltinn2UserClient altinn2UserClient)
        {
            _altinn2UserClient = altinn2UserClient;
        }

        /// <inheritdoc />
        public async Task AddAltinn2User(Altinn2UserRequest request)
        {
            using HttpResponseMessage response = await _altinn2UserClient.AddAltinn2User(request);
            
            if (response.StatusCode != HttpStatusCode.OK)
            {
                string body = await response.Content.ReadAsStringAsync();
                
                // TODO: better error handling (and maybe ProblemDetails?)
                throw new HttpStatusException("about:blank", "Account link failed", response.StatusCode, string.Empty, body);
            }
        }
    }
}
