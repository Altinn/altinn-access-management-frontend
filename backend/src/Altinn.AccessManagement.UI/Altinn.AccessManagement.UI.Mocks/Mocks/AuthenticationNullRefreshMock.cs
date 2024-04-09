﻿using System.Threading.Tasks;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IAuthenticationClient"></see> interface
    /// </summary>
    public class AuthenticationNullRefreshMock : IAuthenticationClient
    {
        /// <inheritdoc/>
        public Task<string> RefreshToken()
        {
            return Task.FromResult<string>(null);
        }
    }
}
