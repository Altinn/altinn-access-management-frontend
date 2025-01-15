using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserService : ISystemUserService
    {
        private readonly ISystemUserClient _systemUserClient;
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;
        private readonly IResourceRegistryClient _resourceRegistryClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
        /// </summary>
        /// <param name="systemUserClient">The system user client.</param>
        /// <param name="accessManagementClient">The access management client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceRegistryClient">The resource registry client.</param>
        public SystemUserService(
            ISystemUserClient systemUserClient,
            IAccessManagementClient accessManagementClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient,
            IResourceRegistryClient resourceRegistryClient)
        {
            _systemUserClient = systemUserClient;
            _accessManagementClient = accessManagementClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
            _resourceRegistryClient = resourceRegistryClient;
        }

        /// <inheritdoc />
        public async Task<bool> DeleteSystemUser(int partyId, Guid id, CancellationToken cancellationToken)
        {
            return await _systemUserClient.DeleteSystemUser(partyId, id, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<List<SystemUserFE>>> GetAllSystemUsersForParty(int partyId, string languageCode, CancellationToken cancellationToken)
        {
            AuthorizedParty party = await _accessManagementClient.GetPartyFromReporteeListIfExists(partyId);
            if (party is null)
            {
                return Problem.Reportee_Orgno_NotFound;
            }
            
            List<SystemUser> lista = await _systemUserClient.GetSystemUsersForParty(partyId, cancellationToken);

            return await MapToSystemUsersFE(lista, languageCode, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<SystemUserFE> GetSpecificSystemUser(int partyId, Guid id, string languageCode, CancellationToken cancellationToken)
        {
            SystemUser systemUser = await _systemUserClient.GetSpecificSystemUser(partyId, id, cancellationToken);
            
            if (systemUser != null)
            {
                return (await MapToSystemUsersFE([systemUser], languageCode, cancellationToken))[0] ?? null;
            }

            return null;
        }

        /// <inheritdoc />
        public async Task<Result<SystemUser>> CreateSystemUser(int partyId, NewSystemUserRequest newSystemUser, CancellationToken cancellationToken)
        {
            AuthorizedParty party = await _accessManagementClient.GetPartyFromReporteeListIfExists(partyId);
            if (party is null)
            {
                return Problem.Reportee_Orgno_NotFound;
            }

            Result<SystemUser> createdSystemUser = await _systemUserClient.CreateNewSystemUser(partyId, newSystemUser, cancellationToken);

            return createdSystemUser;
        }

        private async Task<List<SystemUserFE>> MapToSystemUsersFE(List<SystemUser> systemUsers, string languageCode, CancellationToken cancellationToken)
        {
            List<PartyName> partyNames = await _registerClient.GetPartyNames(systemUsers.Select(x => x.SupplierOrgNo), cancellationToken);
            List<ServiceResource> resources = await _resourceRegistryClient.GetResources();
            OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();
            
            List<SystemUserFE> lista = new List<SystemUserFE>();
            foreach (SystemUser systemUser in systemUsers)
            {
                // TODO: get rights from systemuser when API to look up actual rights is implmented
                List<Right> rights = await _systemRegisterClient.GetRightsFromSystem(systemUser.SystemId, cancellationToken);
                List<string> resourceIds = ResourceUtils.GetResourceIdsFromRights(rights);
                IEnumerable<ServiceResource> systemUserResources = resources.Where(x => resourceIds.Contains(x.Identifier));

                lista.Add(new SystemUserFE
                {
                    Id = systemUser.Id,
                    IntegrationTitle = systemUser.IntegrationTitle,
                    PartyId = systemUser.PartyId,
                    SupplierOrgNo = systemUser.SupplierOrgNo,
                    SystemId = systemUser.SystemId,
                    Created = systemUser.Created,
                    SupplierName = partyNames.Find(x => x.OrgNo == systemUser.SupplierOrgNo)?.Name ?? "N/A",
                    Resources = ResourceUtils.MapToServiceResourcesFE(languageCode, systemUserResources, orgList)
                });
            }

            return lista;
        }
    }
}