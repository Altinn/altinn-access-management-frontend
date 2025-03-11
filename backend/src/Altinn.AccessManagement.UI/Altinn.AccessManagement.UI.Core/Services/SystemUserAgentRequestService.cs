using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserAgentRequestService : ISystemUserAgentRequestService
    {
        private readonly ISystemUserAgentRequestClient _systemUserAgentRequestClient;
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentRequestService"/> class.
        /// </summary>
        /// <param name="systemUserAgentRequestClient">The system user agent request client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        public SystemUserAgentRequestService(
            ISystemUserAgentRequestClient systemUserAgentRequestClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient)
        {
            _systemUserAgentRequestClient = systemUserAgentRequestClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
        }

        /// <inheritdoc />
        public async Task<Result<SystemUserAgentRequestFE>> GetSystemUserAgentRequest(int partyId, Guid agentRequestId, string languageCode, CancellationToken cancellationToken)
        {
            Result<SystemUserAgentRequest> agentRequest = await _systemUserAgentRequestClient.GetSystemUserAgentRequest(partyId, agentRequestId, cancellationToken);
            
            if (agentRequest.IsProblem)
            {
                return new Result<SystemUserAgentRequestFE>(agentRequest.Problem);
            }

            RegisteredSystem system = await _systemRegisterClient.GetSystem(agentRequest.Value.SystemId, cancellationToken);
            var orgNames = await _registerClient.GetPartyNames([system.SystemVendorOrgNumber], cancellationToken);
            RegisteredSystemFE systemFE = SystemRegisterUtils.MapToRegisteredSystemFE(languageCode, system, orgNames);

            return new SystemUserAgentRequestFE() 
            {
                Id = agentRequest.Value.Id,
                Status = agentRequest.Value.Status,
                RedirectUrl = agentRequest.Value.RedirectUrl,
                System = systemFE
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> ApproveSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken)
        {
            return await _systemUserAgentRequestClient.ApproveSystemUserAgentRequest(partyId, agentRequestId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RejectSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken)
        {
            return await _systemUserAgentRequestClient.RejectSystemUserAgentRequest(partyId, agentRequestId, cancellationToken);
        }
    }
}