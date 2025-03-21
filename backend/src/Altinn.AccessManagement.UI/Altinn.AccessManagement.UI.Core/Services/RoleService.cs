using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.Role.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class RoleService : IRoleService
    {
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IAccessPackageClient _accessPackageClient;
        private readonly ILookupService _lookupService;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleService"/> class.
        /// </summary>
        /// <param name="accessManagementClient">The access management client.</param>
        /// <param name="accessPackageClient">The access package client.</param>
        /// <param name="lookupService">The lookup service.</param>s
        public RoleService(IAccessManagementClient accessManagementClient, IAccessPackageClient accessPackageClient, ILookupService lookupService)
        {
            _accessManagementClient = accessManagementClient;
            _accessPackageClient = accessPackageClient;
            _lookupService = lookupService;
        }

        /// <inheritdoc />
        public async Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid)
        {
            return await _accessManagementClient.GetRolesForUser(languageCode, rightOwnerUuid, rightHolderUuid);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateRoleDelegation(Guid from, Guid to, Guid roleId)
        {
            return await _accessManagementClient.CreateRoleDelegation(from, to, roleId);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> DeleteRoleDelegation(Guid assignmentId)
        {
            return await _accessManagementClient.DeleteRoleDelegation(assignmentId);
        }

        /// <inheritdoc />
        public async Task<List<RoleAreaFE>> GetSearch(string languageCode, string searchString)
        {
            var searchMatches = await _accessManagementClient.GetRoleSearchMatches(languageCode, searchString);

            var sortedAreas = new List<RoleAreaFE>();

            foreach (Role searchMatch in searchMatches)
            {
                int premadeAreaIndex = sortedAreas.FindIndex(area => area.Id == searchMatch.Area.Id);

                if (premadeAreaIndex < 0)
                {
                    sortedAreas.Add(new RoleAreaFE(searchMatch.Area, new List<Role> { searchMatch }));
                }
                else
                {
                    sortedAreas[premadeAreaIndex].Roles.Add(searchMatch);
                }
            }

            return sortedAreas;
        }

        /// <inheritdoc />
        public async Task<DelegationCheckResponse> RoleDelegationCheck(Guid rightOwner, Guid roleId)
        {
            return await _accessManagementClient.RoleDelegationCheck(rightOwner, roleId);
        }
    }
}
