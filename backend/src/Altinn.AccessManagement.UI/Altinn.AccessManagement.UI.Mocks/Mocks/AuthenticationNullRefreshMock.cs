using Altinn.AccessManagement.UI.Core.ClientInterfaces;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IAuthenticationClient"></see> interface
    /// </summary>
    public class AuthenticationNullRefreshMock : IAuthenticationClient
    {
        /// <inheritdoc/>
        public async Task<string> RefreshToken()
        {
            return null;
        }
    }
}
