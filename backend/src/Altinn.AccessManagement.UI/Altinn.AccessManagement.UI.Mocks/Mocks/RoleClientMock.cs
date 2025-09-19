using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
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
        public Task<Role?> GetRoleById(string languageCode, Guid id)
        {
            // Trigger internal server error
            if (id.Equals(new Guid("d98ac728-d127-4a4c-96e1-738f856e5332")))
            {
                throw new HttpStatusException(
                    "InternalServerError",
                    "InternalServerError",
                    HttpStatusCode.InternalServerError,
                    "");
            }
            try
            {
                string dataPath = Path.Combine(dataFolder, "Roles", "roles.json");
                List<Role> allRoles =
                    Util.GetMockData<List<Role>>(dataPath);

                Role result = allRoles?.FirstOrDefault(r => r?.Id == id);

                return Task.FromResult(result);
            }
            catch
            {

                throw new HttpStatusException(
                    "Not found",
                    "Not found",
                    HttpStatusCode.NotFound,
                    "");
            }
        }
    }
}