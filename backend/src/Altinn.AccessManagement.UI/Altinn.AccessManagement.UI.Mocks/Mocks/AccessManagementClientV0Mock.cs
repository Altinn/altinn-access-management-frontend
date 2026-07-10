using System.IdentityModel.Tokens.Jwt;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessManagementClient"></see> interface
    /// </summary>
    public class AccessManagementClientV0Mock : IAccessManagementClientV0
    {
        private readonly string dataFolder;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public AccessManagementClientV0Mock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public Task<AuthorizedParty> GetPartyFromReporteeListIfExists(Guid partyUuid)
        {
            try
            {
                var returnedParty = Util.GetMockData<AuthorizedParty>(Path.Combine(dataFolder, "ReporteeList", "GetPartyFromReporteeList", partyUuid + ".json"));
                if (returnedParty != null && returnedParty.PartyUuid == partyUuid)
                {
                    return Task.FromResult(returnedParty);
                }
                else if (returnedParty != null)
                {
                    return Task.FromResult(returnedParty.Subunits?.FirstOrDefault(subunit => subunit.PartyUuid == partyUuid));
                }

                return Task.FromResult<AuthorizedParty>(null);
            }
            catch (FileNotFoundException)
            {
                return Task.FromResult<AuthorizedParty>(null);
            }
        }

        /// <inheritdoc />
        public Task<List<AuthorizedParty>> GetReporteeListForUser()
        {
            try
            {
                var token = GetTokenFromRequest();
                var handler = new JwtSecurityTokenHandler();
                var jwtSecurityToken = handler.ReadJwtToken(token);
                var partyId = jwtSecurityToken.Payload["urn:altinn:userid"].ToString();
                if (partyId == "500")
                {
                    throw new Exception("Internal Server Error");
                }
                return Task.FromResult(Util.GetMockData<List<AuthorizedParty>>(Path.Combine(dataFolder, "ReporteeList", $"{partyId}.json")));
            }
            catch (FileNotFoundException)
            {
                return Task.FromResult<List<AuthorizedParty>>(null);
            }
        }

        private string GetTokenFromRequest()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.Request.Headers.ContainsKey("Authorization"))
            {
                var token = httpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                return token;
            }
            return null;
        }
    }
}

