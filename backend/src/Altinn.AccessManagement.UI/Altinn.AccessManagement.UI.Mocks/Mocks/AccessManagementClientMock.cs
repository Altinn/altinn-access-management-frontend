using System.Data;
using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessManagementClient"></see> interface
    /// </summary>
    public class AccessManagementClientMock : IAccessManagementClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public AccessManagementClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId)
        {
            try
            {
                return Task.FromResult(Util.GetMockData<AuthorizedParty>(Path.Combine(dataFolder, "ReporteeList", "GetPartyFromReporteeList", partyId + ".json")));
            }
            catch (FileNotFoundException)
            {

                return Task.FromResult<AuthorizedParty>(null);
            }

        }

        /// <inheritdoc />
        public async Task<UserAccesses> GetUserAccesses(Guid from, Guid to)
        {
            try
            {
                string dataPath = Path.Combine(dataFolder, "RightHolders", "UserAccesses", $"{from}_{to}.json");
                return await Task.FromResult(Util.GetMockData<UserAccesses>(dataPath));
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        //// Roles

        public Task<List<Role>> GetRoleSearchMatches(string languageCode, string searchString)
        {
            List<Role> allRoles = Util.GetMockData<List<Role>>($"{dataFolder}/Roles/roles_old.json");
            return searchString != null ? Task.FromResult(allRoles.Where(role => role.Name.ToLower().Contains(searchString.ToLower())).ToList()) : Task.FromResult(allRoles);
        }

        /// <inheritdoc />    
        public Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid)
        {
            if (rightHolderUuid == Guid.Empty)
            {
                throw new Exception("Right holder uuid is not valid");
            }
            try
            {
                List<RoleAssignment> allAssignments = Util.GetMockData<List<RoleAssignment>>($"{dataFolder}/Roles/GetRolesForUser/{rightHolderUuid}.json");
                if (allAssignments == null)
                {
                    return Task.FromResult(new List<RoleAssignment>());
                }
                return Task.FromResult(allAssignments);
            }
            catch
            {
                return Task.FromResult(new List<RoleAssignment>());
            }
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> CreateRoleDelegation(Guid from, Guid to, Guid roleId)
        {
            if (to == Guid.Empty)
            {
                throw new Exception("Right holder uuid is not valid");
            }
            // Mocking delegate error - role "Kundeadministrator"
            if (roleId.ToString() == "3abe9842-06a5-483f-b76d-a65dec152b2d")
            {
                throw new Exception("Assignment id is not valid");
            }

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> DeleteRoleDelegation(Guid assignmentId)
        {
            if (assignmentId == Guid.Empty)
            {
                throw new Exception("Right holder uuid is not valid");
            }
            // Mocking revoke error - role "Kundeadministrator" for user "medaljong sitrongul"
            if (assignmentId.ToString() == "5e9700d8-1d03-4665-8ce0-13a028741938")
            {
                throw new Exception("Assignment id is not valid");
            }

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        }

        // A helper for testing handling of exceptions in client
        private static void ThrowExceptionIfTriggerParty(string id)
        {
            if (id == "********" || id == "00000000-0000-0000-0000-000000000000")
            {
                throw new Exception();
            }
        }
    }
}
