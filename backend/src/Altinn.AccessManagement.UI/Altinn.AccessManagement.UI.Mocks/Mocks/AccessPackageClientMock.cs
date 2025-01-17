using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessPackageClient"></see> interface
    /// </summary>
    public class AccessPackageClientMock : IAccessPackageClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public AccessPackageClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<List<AccessPackage>> GetAccessPackageSearchMatches(string languageCode, string searchString)
        {

            List<AccessPackage> allPackages = Util.GetMockData<List<AccessPackage>>($"{dataFolder}/AccessPackage/packages.json");

            return searchString != null ? Task.FromResult(allPackages.Where(package => package.Name.ToLower().Contains(searchString.ToLower())).ToList()) : Task.FromResult(allPackages);
        }

        /// <inheritdoc />    
        public Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid)
        {
            try {
                List<RoleAssignment> allAssignments = Util.GetMockData<List<RoleAssignment>>($"{dataFolder}/Roles/GetRolesForUser/{rightHolderUuid}.json");
                if (allAssignments == null)
                {
                    return Task.FromResult(new List<RoleAssignment>());
                }
                return Task.FromResult(allAssignments);
            } catch {
                return Task.FromResult(new List<RoleAssignment>());
            }
        }
    }
}
