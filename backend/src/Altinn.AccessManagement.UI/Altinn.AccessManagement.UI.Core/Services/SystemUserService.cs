using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;
using Altinn.Platform.Register.Models;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserService : ISystemUserService
    {
        private readonly ISystemUserClient _systemUserClient;
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;
        private readonly ResourceHelper _resourceHelper;
        private readonly IOptions<FeatureFlags> _featureFlags;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
        /// </summary>
        /// <param name="systemUserClient">The system user client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceHelper">Resources helper to enrich resources</param>
        /// <param name="featureFlags">Feature flags</param>
        public SystemUserService(
            ISystemUserClient systemUserClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient,
            ResourceHelper resourceHelper,
            IOptions<FeatureFlags> featureFlags)
        {
            _systemUserClient = systemUserClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
            _resourceHelper = resourceHelper;
            _featureFlags = featureFlags;
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

            return await MapSingleStandardSystemUser(systemUser, languageCode, cancellationToken);
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
                return await MapSingleAgentSystemUser(systemUser, languageCode, cancellationToken);
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

        private async Task<Result<SystemUserFE>> MapSingleStandardSystemUser(SystemUser systemUser, string languageCode, CancellationToken cancellationToken)
        {
            // map system user
            SystemUserFE systemUserFE = (await MapToSystemUsersFE([systemUser], cancellationToken))[0];

            // get access packages and rights
            Result<StandardSystemUserDelegations> delegations = await _systemUserClient.GetListOfDelegationsForStandardSystemUser(systemUser.PartyId, systemUser.Id, cancellationToken);
            if (delegations.IsProblem)
            {
                return delegations.Problem;
            }

            RegisteredSystemRightsFE enrichedRights = await _resourceHelper.MapRightsToFrontendObjects(delegations.Value.Rights, delegations.Value.AccessPackages, languageCode);
            systemUserFE.AccessPackages = enrichedRights.AccessPackages;
            systemUserFE.Resources = enrichedRights.Resources;
            return systemUserFE;
        }

        private async Task<SystemUserFE> MapSingleAgentSystemUser(SystemUser systemUser, string languageCode, CancellationToken cancellationToken)
        {
            // map system user
            SystemUserFE systemUserFE = (await MapToSystemUsersFE([systemUser], cancellationToken))[0];

            // TODO: get rights from systemuser when API to look up actual rights is implemented
            RegisteredSystem system = await _systemRegisterClient.GetSystem(systemUser.SystemId, cancellationToken);

            // get access packages and rights
            RegisteredSystemRightsFE enrichedRights = await _resourceHelper.MapRightsToFrontendObjects(system.Rights, systemUser.AccessPackages, languageCode);
            systemUserFE.AccessPackages = enrichedRights.AccessPackages;
            systemUserFE.Resources = enrichedRights.Resources;
            return systemUserFE;
        }
    }
}