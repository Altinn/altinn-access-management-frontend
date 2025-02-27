using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserClientDelegationRequestService : ISystemUserClientDelegationRequestService
    {
        private readonly ISystemUserClientDelegationRequestClient _systemUserClientDelegationRequestClient;
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserClientDelegationRequestService"/> class.
        /// </summary>
        /// <param name="systemUserClientDelegationRequestClient">The system user request client.</param>
        /// <param name="resourceHelper">The resource helper</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        public SystemUserClientDelegationRequestService(
            ISystemUserClientDelegationRequestClient systemUserClientDelegationRequestClient,
            ResourceHelper resourceHelper,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient)
        {
            _systemUserClientDelegationRequestClient = systemUserClientDelegationRequestClient;
            _resourceHelper = resourceHelper;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
        }

        /// <inheritdoc />
        public async Task<Result<SystemUserClientDelegationRequestFE>> GetSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, string languageCode, CancellationToken cancellationToken)
        {
            Result<SystemUserClientDelegationRequest> clientDelegationRequest = await _systemUserClientDelegationRequestClient.GetSystemUserClientDelegationRequest(partyId, clientDelegationRequestId, cancellationToken);
            
            if (clientDelegationRequest.IsProblem)
            {
                return new Result<SystemUserClientDelegationRequestFE>(clientDelegationRequest.Problem);
            }

            RegisteredSystem system = await _systemRegisterClient.GetSystem(clientDelegationRequest.Value.SystemId, cancellationToken);
            var orgNames = await _registerClient.GetPartyNames([system.SystemVendorOrgNumber], cancellationToken);
            RegisteredSystemFE systemFE = SystemRegisterUtils.MapToRegisteredSystemFE(languageCode, system, orgNames);

            return new SystemUserClientDelegationRequestFE() 
            {
                Id = clientDelegationRequest.Value.Id,
                Status = clientDelegationRequest.Value.Status,
                RedirectUrl = clientDelegationRequest.Value.RedirectUrl,
                System = systemFE
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> ApproveSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            return await _systemUserClientDelegationRequestClient.ApproveSystemUserClientDelegationRequest(partyId, clientDelegationRequestId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RejectSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            return await _systemUserClientDelegationRequestClient.RejectSystemUserClientDelegationRequest(partyId, clientDelegationRequestId, cancellationToken);
        }
    }
}