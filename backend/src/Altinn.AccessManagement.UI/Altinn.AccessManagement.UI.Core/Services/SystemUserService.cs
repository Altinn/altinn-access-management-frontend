using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;
using Altinn.Register.Contracts.V1;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserService : ISystemUserService
    {
        private readonly ISystemUserClient _systemUserClient;
        private readonly IRegisterClient _registerClient;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
        /// </summary>
        /// <param name="systemUserClient">The system user client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceHelper">Resources helper to enrich resources</param>
        public SystemUserService(
            ISystemUserClient systemUserClient,
            IRegisterClient registerClient,
            ResourceHelper resourceHelper)
        {
            _systemUserClient = systemUserClient;
            _registerClient = registerClient;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<bool> DeleteSystemUser(int partyId, Guid id, CancellationToken cancellationToken)
        {
            return await _systemUserClient.DeleteSystemUser(partyId, id, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<List<SystemUserFE>>> GetAllSystemUsersForParty(int partyId, CancellationToken cancellationToken)
        {
            List<SystemUser> lista = await _systemUserClient.GetSystemUsersForParty(partyId, cancellationToken);

            return await MapToSystemUsersFE(lista, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<SystemUserFE>> GetSpecificSystemUser(int partyId, Guid id, string languageCode, CancellationToken cancellationToken)
        {
            SystemUser systemUser = await _systemUserClient.GetSpecificSystemUser(partyId, id, cancellationToken);

            if (systemUser is null)
            {
                return Problem.SystemUserNotFound;
            }

            // get access packages and rights for systemuser
            Result<StandardSystemUserDelegations> delegations = await _systemUserClient.GetListOfDelegationsForStandardSystemUser(systemUser.PartyId, systemUser.Id, cancellationToken);
            if (delegations.IsProblem)
            {
                return delegations.Problem;
            }

            return await MapSystemUserAccessPackagesAndRights(systemUser, delegations.Value.Rights, delegations.Value.AccessPackages, languageCode, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<List<SystemUserFE>>> GetAgentSystemUsersForParty(int partyId, CancellationToken cancellationToken)
        {
            List<SystemUser> lista = await _systemUserClient.GetAgentSystemUsersForParty(partyId, cancellationToken);

            return await MapToSystemUsersFE(lista, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<SystemUserFE> GetAgentSystemUser(int partyId, Guid id, string languageCode, CancellationToken cancellationToken)
        {
            SystemUser systemUser = await _systemUserClient.GetAgentSystemUser(partyId, id, cancellationToken);

            if (systemUser != null)
            {
                // TODO: get rights from systemuser when API to look up actual rights is implemented. For now, agent system user cannot have single rights.
                return await MapSystemUserAccessPackagesAndRights(systemUser, [], systemUser.AccessPackages, languageCode, cancellationToken);
            }

            return null;
        }

        /// <inheritdoc />
        public async Task<Result<bool>> DeleteAgentSystemUser(int partyId, Guid systemUserId, Guid partyUuid, CancellationToken cancellationToken)
        {
            return await _systemUserClient.DeleteAgentSystemUser(partyId, systemUserId, partyUuid, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<SystemUser>> CreateSystemUser(int partyId, NewSystemUserRequest newSystemUser, CancellationToken cancellationToken)
        {
            Result<SystemUser> createdSystemUser = await _systemUserClient.CreateNewSystemUser(partyId, newSystemUser, cancellationToken);

            return createdSystemUser;
        }

        private async Task<List<SystemUserFE>> MapToSystemUsersFE(List<SystemUser> systemUsers, CancellationToken cancellationToken)
        {
            List<PartyName> partyNames = await _registerClient.GetPartyNames(systemUsers.Select(x => x.SupplierOrgNo).Distinct(), cancellationToken);
            Dictionary<string, string> nameByOrgNo = partyNames.ToDictionary(p => p.OrgNo, p => p.Name);

            List<SystemUserFE> lista = [];
            foreach (SystemUser systemUser in systemUsers)
            {
                nameByOrgNo.TryGetValue(systemUser.SupplierOrgNo, out var vendorName);
                RegisteredSystemFE systemFE = new()
                {
                    SystemId = systemUser.SystemId,
                    Name = "N/A", // not set since frontend does not use this (and we don't want to look up the system)
                    SystemVendorOrgNumber = systemUser.SupplierOrgNo,
                    SystemVendorOrgName = vendorName ?? "N/A",
                };

                lista.Add(new SystemUserFE
                {
                    Id = systemUser.Id,
                    IntegrationTitle = systemUser.IntegrationTitle,
                    PartyId = systemUser.PartyId,
                    Created = systemUser.Created,
                    System = systemFE,
                    SystemUserType = systemUser.SystemUserType,
                });
            }

            List<SystemUserFE> sortedList = [.. lista.OrderByDescending(systemUser => systemUser.Created)];
            return sortedList;
        }

        private async Task<SystemUserFE> MapSystemUserAccessPackagesAndRights(
            SystemUser systemUser,
            IEnumerable<Right> rights,
            IEnumerable<RegisteredSystemAccessPackage> accessPackages,
            string languageCode,
            CancellationToken cancellationToken)
        {
            // get access packages and rights
            RegisteredSystemRightsFE enrichedRights = await _resourceHelper.MapRightsToFrontendObjects(rights, accessPackages, languageCode);

            // map system user
            SystemUserFE systemUserFE = (await MapToSystemUsersFE([systemUser], cancellationToken))[0];
            systemUserFE.AccessPackages = enrichedRights.AccessPackages;
            systemUserFE.Resources = enrichedRights.Resources;
            return systemUserFE;
        }
    }
}