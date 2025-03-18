using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserChangeRequestService : ISystemUserChangeRequestService
    {
        private readonly ISystemUserChangeRequestClient _systemUserChangeRequestClient;
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserChangeRequestService"/> class.
        /// </summary>
        /// <param name="systemUserChangeRequestClient">The system user request client.</param>
        /// <param name="resourceHelper">The resource helper</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        public SystemUserChangeRequestService(
            ISystemUserChangeRequestClient systemUserChangeRequestClient,
            ResourceHelper resourceHelper,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient)
        {
            _systemUserChangeRequestClient = systemUserChangeRequestClient;
            _resourceHelper = resourceHelper;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
        }

        /// <inheritdoc />
        public async Task<Result<SystemUserChangeRequestFE>> GetSystemUserChangeRequest(int partyId, Guid changeRequestId, string languageCode, CancellationToken cancellationToken)
        {
            Result<SystemUserChangeRequest> changeRequest = await _systemUserChangeRequestClient.GetSystemUserChangeRequest(partyId, changeRequestId, cancellationToken);
            
            if (changeRequest.IsProblem)
            {
                return new Result<SystemUserChangeRequestFE>(changeRequest.Problem);
            }

            // GET resources & access packages
            RegisteredSystemRightsFE enrichedRights = await _resourceHelper.MapRightsToFrontendObjects(changeRequest.Value.RequiredRights, changeRequest.Value.RequiredAccessPackages, languageCode, false);

            RegisteredSystem system = await _systemRegisterClient.GetSystem(changeRequest.Value.SystemId, cancellationToken);
            var orgNames = await _registerClient.GetPartyNames([system.SystemVendorOrgNumber], cancellationToken);
            RegisteredSystemFE systemFE = SystemRegisterUtils.MapToRegisteredSystemFE(languageCode, system, orgNames);

            return new SystemUserChangeRequestFE() 
            {
                Id = changeRequest.Value.Id,
                Status = changeRequest.Value.Status,
                RedirectUrl = changeRequest.Value.RedirectUrl,
                Resources = enrichedRights.Resources,
                AccessPackages = enrichedRights.AccessPackages,
                System = systemFE
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> ApproveSystemUserChangeRequest(int partyId, Guid changeRequestId, CancellationToken cancellationToken)
        {
            return await _systemUserChangeRequestClient.ApproveSystemUserChangeRequest(partyId, changeRequestId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RejectSystemUserChangeRequest(int partyId, Guid changeRequestId, CancellationToken cancellationToken)
        {
            return await _systemUserChangeRequestClient.RejectSystemUserChangeRequest(partyId, changeRequestId, cancellationToken);
        }
    }
}