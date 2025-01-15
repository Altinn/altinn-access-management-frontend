using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessPackageClient"></see> interface
    /// </summary>
    public class RoleClientMock : IRoleClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
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
        public Task<List<Role>> GetRoles(string languageCode)
        {
            string json = File.ReadAllText(Path.Combine(dataFolder, "Roles.json"));
            return Task.FromResult(JsonSerializer.Deserialize<List<Role>>(json, options));
        }

        public Task<List<Assignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid)
        {
            List<Assignment> allAssignments = Util.GetMockData<List<Assignment>>($"{dataFolder}/Roles/GetRoles/{rightHolderUuid}.json");
            if (allAssignments == null)
            {
                return Task.FromResult(new List<Assignment>());
            }
            return Task.FromResult(allAssignments);
        }
    }
}
