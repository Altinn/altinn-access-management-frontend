using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the delegation client. Processes and maps the required data to the frontend model
    /// </summary>
    public class UserService : IUserService
    {
        private readonly ILogger _logger;
        private readonly IProfileClient _profileClient;
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IAccessManagementClientV0 _accessManagementClientV0;

        /// <summary>
        /// Initializes a new instance of the <see cref="APIDelegationService"/> class.
        /// </summary>
        /// <param name="logger">handler for logger</param>
        /// <param name="profileClient">handler for profile client</param>
        /// <param name="accessManagementClient">handler for AM client</param>
        /// <param name="accessManagementClientV0">handler for old AM client</param>
        public UserService(
            ILogger<IAPIDelegationService> logger,
            IProfileClient profileClient,
            IAccessManagementClient accessManagementClient,
            IAccessManagementClientV0 accessManagementClientV0)
        {
            _logger = logger;
            _profileClient = profileClient;
            _accessManagementClient = accessManagementClient;
            _accessManagementClientV0 = accessManagementClientV0;
        }

        /// <inheritdoc/>
        public async Task<UserProfileFE> GetUserProfile(int userId)
        {
            UserProfile userProfile = await _profileClient.GetUserProfile(userId);
            return userProfile == null ? null : new UserProfileFE(userProfile);         
        }

        /// <inheritdoc/>        
        public async Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId)
        {
            AuthorizedParty partyInfo = await _accessManagementClientV0.GetPartyFromReporteeListIfExists(partyId);
            return partyInfo;
        }

        /// <inheritdoc/>
        public async Task<List<RightHolder>> GetReporteeRightHolders(int partyId)
        {
            List<AuthorizedParty> rightHolders = await _accessManagementClient.GetReporteeRightHolders(partyId);

            return rightHolders.Select(rightHolder => new RightHolder(rightHolder)).ToList();
        }

        /// <inheritdoc/>
        public Task<RightHolderAccesses> GetRightHolderAccesses(string reporteeUuid, string rightHolderUuid)
        {
            return _accessManagementClient.GetRightHolderAccesses(reporteeUuid, rightHolderUuid);
        }
    }
}
