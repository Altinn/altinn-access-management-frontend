using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.IdPortenAuthorization;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Client for interacting with the IdPortenAuthorization API
    /// </summary>
    public class IdPortenAuthorizationClientMock : IIdPortenAuthorizationClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="IdPortenAuthorizationClientMock" /> class
        /// </summary>
        public IdPortenAuthorizationClientMock(HttpClient httpClient,
            ILogger<IdPortenAuthorizationClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(IdPortenAuthorizationClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public async Task<IEnumerable<IdPortenAuthorization>> GetIdPortenAuthorizations(CancellationToken cancellationToken)
        {
            string dataPath = Path.Combine(dataFolder, "IdPortenAuthorization", "idPortenAuthorizations.json");
            return await Task.FromResult(Util.GetMockData<IEnumerable<IdPortenAuthorization>>(dataPath));
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawIdPortenAuthorization(string id, CancellationToken cancellationToken)
        {
            if (id == "00000000-0000-0000-0000-000000000000")
            {
                throw new Exception("Simulated internal error");
            } 
            else if (id == "11111111-1111-1111-1111-111111111111")
            {
                throw new HttpRequestException("Simulated not found error", null, System.Net.HttpStatusCode.NotFound);
            }

            return true;
        }
    }
}