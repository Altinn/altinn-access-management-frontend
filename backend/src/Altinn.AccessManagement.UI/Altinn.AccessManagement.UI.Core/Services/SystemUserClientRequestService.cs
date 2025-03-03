using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserClientRequestService : ISystemUserClientRequestService
    {
        private readonly ISystemUserClientRequestClient _systemUserClientRequestClient;
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserClientRequestService"/> class.
        /// </summary>
        /// <param name="systemUserClientRequestClient">The system user request client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        public SystemUserClientRequestService(
            ISystemUserClientRequestClient systemUserClientRequestClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient)
        {
            _systemUserClientRequestClient = systemUserClientRequestClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
        }

        /// <inheritdoc />
        public async Task<Result<SystemUserClientRequestFE>> GetSystemUserClientRequest(int partyId, Guid clientRequestId, string languageCode, CancellationToken cancellationToken)
        {
            Result<SystemUserClientRequest> clientRequest = await _systemUserClientRequestClient.GetSystemUserClientRequest(partyId, clientRequestId, cancellationToken);
            
            if (clientRequest.IsProblem)
            {
                return new Result<SystemUserClientRequestFE>(clientRequest.Problem);
            }

            RegisteredSystem system = await _systemRegisterClient.GetSystem(clientRequest.Value.SystemId, cancellationToken);
            var orgNames = await _registerClient.GetPartyNames([system.SystemVendorOrgNumber], cancellationToken);
            RegisteredSystemFE systemFE = SystemRegisterUtils.MapToRegisteredSystemFE(languageCode, system, orgNames);

            return new SystemUserClientRequestFE() 
            {
                Id = clientRequest.Value.Id,
                Status = clientRequest.Value.Status,
                RedirectUrl = clientRequest.Value.RedirectUrl,
                System = systemFE
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> ApproveSystemUserClientRequest(int partyId, Guid clientRequestId, CancellationToken cancellationToken)
        {
            return await _systemUserClientRequestClient.ApproveSystemUserClientRequest(partyId, clientRequestId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RejectSystemUserClientRequest(int partyId, Guid clientRequestId, CancellationToken cancellationToken)
        {
            return await _systemUserClientRequestClient.RejectSystemUserClientRequest(partyId, clientRequestId, cancellationToken);
        }
    }
}