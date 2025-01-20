using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
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
        private readonly IResourceRegistryClient _resourceRegistryClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserRequestService"/> class.
        /// </summary>
        /// <param name="systemUserRequestClient">The system user request client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceRegistryClient">The resource registry client.</param>
        public SystemUserRequestService(
            ISystemUserRequestClient systemUserRequestClient,
            IResourceRegistryClient resourceRegistryClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient)
        {
            _systemUserRequestClient = systemUserRequestClient;
            _resourceRegistryClient = resourceRegistryClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
        }

        /// <inheritdoc />
        public async Task<Result<SystemUserRequestFE>> GetSystemUserRequest(int partyId, Guid requestId, string languageCode, CancellationToken cancellationToken = default)
        {
            Result<SystemUserRequest> request = await _systemUserRequestClient.GetSystemUserRequest(partyId, requestId, cancellationToken);
            
            if (request.IsProblem)
            {
                return new Result<SystemUserRequestFE>(request.Problem);
            }

            // GET resources
            List<string> resourceIds = ResourceUtils.GetResourceIdsFromRights(request.Value.Rights);
            IEnumerable<Task<ServiceResource>> resourceTasks = resourceIds.Select(resourceId => _resourceRegistryClient.GetResource(resourceId));
            IEnumerable<ServiceResource> resources = await Task.WhenAll(resourceTasks);
            OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();
            List<ServiceResourceFE> resourcesFE = ResourceUtils.MapToServiceResourcesFE(languageCode, resources, orgList);
            
            // GET system
            RegisteredSystem system = await _systemRegisterClient.GetSystem(request.Value.SystemId, cancellationToken);
            var orgNames = await _registerClient.GetPartyNames([system.SystemVendorOrgNumber], cancellationToken);
            RegisteredSystemFE systemFE = new RegisteredSystemFE() 
            {
                SystemId = system.SystemId,
                Name = system.Name.TryGetValue(languageCode, out string name) ? name : "N/A",
                SystemVendorOrgNumber = system.SystemVendorOrgNumber,
                SystemVendorOrgName = orgNames.Find(x => x.OrgNo == system.SystemVendorOrgNumber)?.Name ?? "N/A"
            };

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
        public async Task<Result<bool>> ApproveSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken = default)
        {
            return await _systemUserRequestClient.ApproveSystemUserRequest(partyId, requestId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RejectSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken = default)
        {
            return await _systemUserRequestClient.RejectSystemUserRequest(partyId, requestId, cancellationToken);
        }
    }
}