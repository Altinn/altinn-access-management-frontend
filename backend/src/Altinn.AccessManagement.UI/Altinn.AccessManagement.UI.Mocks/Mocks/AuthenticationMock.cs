using System.Threading.Tasks;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IAuthenticationClient"></see> interface
    /// </summary>
    public class AuthenticationMock : IAuthenticationClient
    {
        /// <inheritdoc/>
        public async Task<string> RefreshToken()
        {
            return PrincipalUtil.GetAccessToken("sbl-authorization");
        }
    }
}
