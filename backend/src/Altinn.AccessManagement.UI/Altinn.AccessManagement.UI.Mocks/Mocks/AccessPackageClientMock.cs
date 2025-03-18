using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models;
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

        public Task<List<Role>> GetRoleSearchMatches(string languageCode, string searchString)
        {
            List<Role> allRoles = Util.GetMockData<List<Role>>($"{dataFolder}/Roles/roles.json");
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

        public Task<DelegationCheckResponse> RoleDelegationCheck(Guid rightOwner, Guid roleId)
        {
            if (rightOwner == Guid.Empty)
            {
                throw new Exception("Right holder uuid is not valid");
            }
            try
            {
                DelegationCheckResponse res = Util.GetMockData<DelegationCheckResponse>($"{dataFolder}/Roles/DelegationCheck/{roleId}.json");
                return Task.FromResult(res);
            }
            catch
            {
                return Task.FromResult(new DelegationCheckResponse()
                {
                    CanDelegate = false,
                    DetailCode = DetailCode.Unknown
                });
            }
        }
        
        /// <inheritdoc />
        public Task<List<AccessPackageDelegationCheckResponse>> AccessPackageDelegationCheck(DelegationCheckRequest delegationCheckRequest)
        {
            var res = new List<AccessPackageDelegationCheckResponse>();
            foreach (var packageId in delegationCheckRequest.PackageIds)
            {   
                if(packageId.ToString() == "fa84bffc-ac17-40cd-af9c-61c89f92e44c")
                {
                    throw new Exception("Package id is not valid");
                }
                try {
                    var check = Util.GetMockData<AccessPackageDelegationCheckResponse>($"{dataFolder}/AccessPackage/DelegationCheck/{packageId}.json");
                    res.Add(check);
                } catch {
                    res.Add(new AccessPackageDelegationCheckResponse()
                    {
                        CanDelegate = true,
                        DetailCode = DetailCode.DelegationAccess,
                        PackageId = packageId
                    });
                }
            }
            return Task.FromResult(res);
        }
    }
}
