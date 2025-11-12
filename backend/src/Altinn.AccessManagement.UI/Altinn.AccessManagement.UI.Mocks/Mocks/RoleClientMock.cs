using System.Collections.Generic;
using System.IO;
using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IRoleClient"></see> interface
    /// </summary>
    public class RoleClientMock : IRoleClient
    {
        private readonly string _dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="RoleClientMock" /> class
        /// </summary>
        public RoleClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<PaginatedResult<RolePermission>> GetRoleConnections(Guid party, Guid? from, Guid? to, string languageCode)
        {
            Util.ThrowExceptionIfTriggerParty(from?.ToString());
            try
            {
                string dataPath = Path.Combine(_dataFolder, "Roles", "Connections", $"{from?.ToString() ?? string.Empty}_{to?.ToString() ?? string.Empty}.json");
                return Task.FromResult(Util.GetMockData<PaginatedResult<RolePermission>>(dataPath));
            }
            catch
            {
                throw new HttpStatusException(
                    "StatusError",
                    "Unexpected mockResponse status from Access Management",
                    HttpStatusCode.BadRequest,
                    string.Empty);
            }
        }

        /// <inheritdoc />
        public Task<RoleMetadata> GetRoleById(Guid roleId, string languageCode)
        {
            string triggerValue = roleId.ToString();
            Util.ThrowExceptionIfTriggerParty(triggerValue);

            try
            {
                string dataPath = Path.Combine(_dataFolder, "Roles", "Details", $"{roleId}.json");
                return Task.FromResult(Util.GetMockData<RoleMetadata>(dataPath));
            }
            catch (FileNotFoundException)
            {
                return Task.FromResult<RoleMetadata>(null);
            }
            catch
            {
                throw new HttpStatusException(
                    "StatusError",
                    "Unexpected mockResponse status from Access Management",
                    HttpStatusCode.BadRequest,
                    string.Empty);
            }
        }

        /// <inheritdoc />
        public Task<IEnumerable<AccessPackage>> GetRolePackages(Guid roleId, string variant, bool includeResources, string languageCode)
        {
            try
            {
                string dataPath = Path.Combine(_dataFolder, "Roles", "Packages", $"{roleId}.json");
                return Task.FromResult(Util.GetMockData<IEnumerable<AccessPackage>>(dataPath));
            }
            catch
            {
                throw new HttpStatusException(
                    "StatusError",
                    "Unexpected mockResponse status from Access Management",
                    HttpStatusCode.BadRequest,
                    string.Empty);
            }
        }

        /// <inheritdoc />
        public Task<IEnumerable<ResourceAM>> GetRoleResources(Guid roleId, string variant, bool includePackageResources, string languageCode)
        {
            try
            {
                string dataPath = Path.Combine(_dataFolder, "Roles", "Resources", $"{roleId}.json");
                return Task.FromResult(Util.GetMockData<IEnumerable<ResourceAM>>(dataPath));
            }
            catch
            {
                throw new HttpStatusException(
                    "StatusError",
                    "Unexpected mockResponse status from Access Management",
                    HttpStatusCode.BadRequest,
                    string.Empty);
            }
        }
    }
}
