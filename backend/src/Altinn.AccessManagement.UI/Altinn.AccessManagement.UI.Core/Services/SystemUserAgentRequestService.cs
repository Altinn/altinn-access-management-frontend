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
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentRequestService"/> class.
        /// </summary>
        /// <param name="systemUserAgentRequestClient">The system user agent request client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceHelper">Resources helper to enrich resources</param>
        public SystemUserAgentRequestService(
            ISystemUserAgentRequestClient systemUserAgentRequestClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient,
            ResourceHelper resourceHelper)
        {
            _systemUserAgentRequestClient = systemUserAgentRequestClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<Result<SystemUserAgentRequestFE>> GetSystemUserAgentRequest(Guid agentRequestId, string languageCode, CancellationToken cancellationToken)
        {
            Result<SystemUserAgentRequest> agentRequest = await _systemUserAgentRequestClient.GetSystemUserAgentRequest(agentRequestId, cancellationToken);
            
            if (agentRequest.IsProblem)
            {
                return new Result<SystemUserAgentRequestFE>(agentRequest.Problem);
            }

            // GET resources & access packages
            RegisteredSystemRightsFE enrichedRights = await _resourceHelper.MapRightsToFrontendObjects([], agentRequest.Value.AccessPackages, languageCode);

            // GET system
            RegisteredSystem system = await _systemRegisterClient.GetSystem(agentRequest.Value.SystemId, cancellationToken);
            var orgNames = await _registerClient.GetPartyNames([system.SystemVendorOrgNumber], cancellationToken);
            RegisteredSystemFE systemFE = SystemRegisterUtils.MapToRegisteredSystemFE(languageCode, system, orgNames);

            return new SystemUserAgentRequestFE() 
            {
                Id = agentRequest.Value.Id,
                PartyId = agentRequest.Value.PartyId,
                PartyUuid = agentRequest.Value.PartyUuid,
                Status = agentRequest.Value.Status,
                RedirectUrl = agentRequest.Value.RedirectUrl,
                AccessPackages = enrichedRights.AccessPackages,
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