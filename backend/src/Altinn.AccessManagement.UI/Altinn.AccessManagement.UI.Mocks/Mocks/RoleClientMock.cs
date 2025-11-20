using System;
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
        public Task<PaginatedResult<RolePermission>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode)
        {
            Util.ThrowExceptionIfTriggerParty(from?.ToString());
            try
            {
                string dataPath = GetRolePermissionsDataPath(from, to);
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

        private string GetRolePermissionsDataPath(Guid? from, Guid? to)
        {
            string folder = Path.Combine(_dataFolder, "Roles", "Permissions");
            string shortFileName = $"{ShortenIdentifier(from)}_{ShortenIdentifier(to)}.json";
            string shortPath = Path.Combine(folder, shortFileName);

            if (File.Exists(shortPath))
            {
                return shortPath;
            }

            string legacyFileName = $"{from?.ToString() ?? string.Empty}_{to?.ToString() ?? string.Empty}.json";
            return Path.Combine(folder, legacyFileName);
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
        public Task<IEnumerable<RoleMetadata>> GetAllRoles(string languageCode)
        {
            string dataPath = Path.Combine(_dataFolder, "Roles", "roles.json");
            try
            {
                return Task.FromResult(Util.GetMockData<IEnumerable<RoleMetadata>>(dataPath));
            }
            catch (FileNotFoundException)
            {
                return Task.FromResult(Enumerable.Empty<RoleMetadata>());
            }
            catch (Exception ex)
            {
                throw new Exception($"Unexpected error reading mock roles from {dataPath}", ex);
            }
        }

        /// <inheritdoc />
        public Task<IEnumerable<AccessPackage>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode)
        {
            string dataPath = Path.Combine(_dataFolder, "Roles", "Packages", $"{roleCode}.json");
            return Task.FromResult(Util.GetMockData<IEnumerable<AccessPackage>>(dataPath));
        }

        /// <inheritdoc />
        public Task<IEnumerable<ResourceAM>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode)
        {
            string dataPath = Path.Combine(_dataFolder, "Roles", "Resources", $"{roleCode}.json");
            return Task.FromResult(Util.GetMockData<IEnumerable<ResourceAM>>(dataPath));
        }

        private static string ShortenIdentifier(Guid? id)
        {
            return id.HasValue ? id.Value.ToString("N")[..8] : "none";
        }
    }
}
