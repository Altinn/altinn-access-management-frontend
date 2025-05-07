using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Helpers;
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
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
        /// </summary>
        /// <param name="systemUserClient">The system user client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceHelper">Resources helper to enrich resources</param>
        public SystemUserService(
            ISystemUserClient systemUserClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient,
            ResourceHelper resourceHelper)
        {
            _systemUserClient = systemUserClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<bool> DeleteSystemUser(Guid partyId, Guid id, CancellationToken cancellationToken)
        {
            return await _systemUserClient.DeleteSystemUser(partyId, id, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<List<SystemUserFE>>> GetAllSystemUsersForParty(Guid partyId, string languageCode, CancellationToken cancellationToken)
        {
            List<SystemUser> lista = await _systemUserClient.GetSystemUsersForParty(partyId, cancellationToken);

            return await MapToSystemUsersFE(lista, languageCode, false, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<SystemUserFE> GetSpecificSystemUser(Guid partyId, Guid id, string languageCode, CancellationToken cancellationToken)
        {
            SystemUser systemUser = await _systemUserClient.GetSpecificSystemUser(partyId, id, cancellationToken);
            
            if (systemUser != null)
            {
                return (await MapToSystemUsersFE([systemUser], languageCode, true, cancellationToken))[0] ?? null;
            }

            return null;
        }

        /// <inheritdoc />
        public async Task<Result<List<SystemUserFE>>> GetAgentSystemUsersForParty(Guid partyId, string languageCode, CancellationToken cancellationToken)
        {
            List<SystemUser> lista = await _systemUserClient.GetAgentSystemUsersForParty(partyId, cancellationToken);

            return await MapToSystemUsersFE(lista, languageCode, false, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<SystemUserFE> GetAgentSystemUser(Guid partyId, Guid id, string languageCode, CancellationToken cancellationToken)
        {
            SystemUser systemUser = await _systemUserClient.GetAgentSystemUser(partyId, id, cancellationToken);
            
            if (systemUser != null)
            {
                return (await MapToSystemUsersFE([systemUser], languageCode, true, cancellationToken))[0] ?? null;
            }

            return null;
        }

        /// <inheritdoc />
        public async Task<Result<bool>> DeleteAgentSystemUser(Guid partyId, Guid systemUserId, CancellationToken cancellationToken)
        {
            return await _systemUserClient.DeleteAgentSystemUser(partyId, systemUserId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<SystemUser>> CreateSystemUser(Guid partyId, NewSystemUserRequest newSystemUser, CancellationToken cancellationToken)
        {
            Result<SystemUser> createdSystemUser = await _systemUserClient.CreateNewSystemUser(partyId, newSystemUser, cancellationToken);

            return createdSystemUser;
        }

        private async Task<List<SystemUserFE>> MapToSystemUsersFE(List<SystemUser> systemUsers, string languageCode, bool includeRights, CancellationToken cancellationToken)
        {
            List<PartyName> partyNames = await _registerClient.GetPartyNames(systemUsers.Select(x => x.SupplierOrgNo), cancellationToken);
            List<SystemUserFE> lista = new List<SystemUserFE>();
            foreach (SystemUser systemUser in systemUsers)
            {
                RegisteredSystemRightsFE enrichedRights = new();
                if (includeRights)
                {
                    // TODO: get rights from systemuser when API to look up actual rights is implmented
                    RegisteredSystem system = await _systemRegisterClient.GetSystem(systemUser.SystemId, cancellationToken);
                    enrichedRights = await _resourceHelper.MapRightsToFrontendObjects(system.Rights, systemUser.AccessPackages, languageCode);
                }

                RegisteredSystemFE systemFE = new RegisteredSystemFE
                {
                    SystemId = systemUser.SystemId,
                    Name = "N/A", // not set since frontend does not use this (and we don't want to look up the system)
                    SystemVendorOrgNumber = systemUser.SupplierOrgNo,
                    SystemVendorOrgName = partyNames.Find(x => x.OrgNo == systemUser.SupplierOrgNo)?.Name ?? "N/A",
                };

                lista.Add(new SystemUserFE
                {
                    Id = systemUser.Id,
                    IntegrationTitle = systemUser.IntegrationTitle,
                    PartyId = systemUser.PartyId,
                    Created = systemUser.Created,
                    System = systemFE,
                    SystemUserType = systemUser.SystemUserType,
                    Resources = enrichedRights.Resources,
                    AccessPackages = enrichedRights.AccessPackages
                });
            }
            
            List<SystemUserFE> sortedList = [.. lista.OrderByDescending(systemUser => systemUser.Created)];
            return sortedList;
        }
    }
}