using System.Threading.Tasks;
using Altinn.AMUI.Core.ClientInterfaces;
using Altinn.AMUI.Mocks.Utils;

namespace Altinn.AMUI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IAuthenticationClient"></see> interface
    /// </summary>
    public class AuthenticationMock : IAuthenticationClient
    {
        /// <inheritdoc/>
        public Task<string> RefreshToken()
        {
            return Task.FromResult(PrincipalUtil.GetAccessToken("sbl-authorization"));
        }

        /// <inheritdoc/>
        public Task<string> GetPidEnrichedToken()
        {
            return Task.FromResult(PrincipalUtil.GetAccessToken("sbl-authorization"));
        }
    }
}
