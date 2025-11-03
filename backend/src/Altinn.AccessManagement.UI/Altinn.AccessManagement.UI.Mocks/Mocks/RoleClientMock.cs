using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessPackageClient"></see> interface
    /// </summary>
    public class RoleClientMock : IRoleClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public RoleClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<PaginatedResult<RolePermission>> GetRoleConnections(Guid party, Guid? to, Guid? from, string languageCode)
        {
            Util.ThrowExceptionIfTriggerParty(from?.ToString());
            try
            {
                string dataPath = Path.Combine(dataFolder, "Roles", "Connections", $"{from}_{to}.json");
                return Task.FromResult(Util.GetMockData<PaginatedResult<RolePermission>>(dataPath));
            }
            catch
            {
                throw new HttpStatusException(
                    "StatusError",
                    "Unexpected mockResponse status from Access Management",
                    HttpStatusCode.BadRequest,
                    "");
            }
        }

        /// <inheritdoc />
        public Task RevokeRole(Guid from, Guid to, Guid party, Guid roleId)
        {
            Util.ThrowExceptionIfTriggerParty(roleId.ToString());

            if (roleId == Guid.Empty)
            {
                throw new HttpStatusException(
                    "StatusError",
                    "Invalid roleId",
                    HttpStatusCode.BadRequest,
                    string.Empty);
            }

            if (roleId == Guid.Parse("00000000-0000-0000-0000-000000000001"))
            {
                throw new HttpStatusException(
                    "StatusError",
                    "Role not found",
                    HttpStatusCode.NotFound,
                    string.Empty);
            }

            return Task.CompletedTask;
        }
    }
}