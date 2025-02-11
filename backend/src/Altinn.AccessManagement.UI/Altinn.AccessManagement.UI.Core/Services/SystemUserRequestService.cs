using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserRequestService : ISystemUserRequestService
    {
        private readonly ISystemUserRequestClient _systemUserRequestClient;
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserRequestService"/> class.
        /// </summary>
        /// <param name="systemUserRequestClient">The system user request client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceHelper">Resources helper to enrich resources</param>
        public SystemUserRequestService(
            ISystemUserRequestClient systemUserRequestClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient,
            ResourceHelper resourceHelper)
        {
            _systemUserRequestClient = systemUserRequestClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<Result<SystemUserRequestFE>> GetSystemUserRequest(int partyId, Guid requestId, string languageCode, CancellationToken cancellationToken)
        {
            Result<SystemUserRequest> request = await _systemUserRequestClient.GetSystemUserRequest(partyId, requestId, cancellationToken);
            
            if (request.IsProblem)
            {
                return new Result<SystemUserRequestFE>(request.Problem);
            }

            // GET resources
            List<string> resourceIds = ResourceUtils.GetResourceIdsFromRights(request.Value.Rights);
            List<ServiceResourceFE> resourcesFE = await _resourceHelper.EnrichResources(resourceIds, languageCode);
            
            // GET system
            RegisteredSystem system = await _systemRegisterClient.GetSystem(request.Value.SystemId, cancellationToken);
            var orgNames = await _registerClient.GetPartyNames([system.SystemVendorOrgNumber], cancellationToken);
            RegisteredSystemFE systemFE = SystemRegisterUtils.MapToRegisteredSystemFE(languageCode, system, orgNames);

            return new SystemUserRequestFE() 
            {
                Id = request.Value.Id,
                Status = request.Value.Status,
                RedirectUrl = request.Value.RedirectUrl,
                Resources = resourcesFE,
                System = systemFE
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> ApproveSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken)
        {
            return await _systemUserRequestClient.ApproveSystemUserRequest(partyId, requestId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RejectSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken)
        {
            return await _systemUserRequestClient.RejectSystemUserRequest(partyId, requestId, cancellationToken);
        }
    }
}