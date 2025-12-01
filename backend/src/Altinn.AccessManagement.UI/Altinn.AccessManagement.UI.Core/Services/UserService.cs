using System.Linq.Expressions;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
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
        private readonly IConnectionClient _connectionClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="APIDelegationService"/> class.
        /// </summary>
        /// <param name="logger">handler for logger</param>
        /// <param name="profileClient">handler for profile client</param>
        /// <param name="accessManagementClient">handler for AM client</param>
        /// <param name="accessManagementClientV0">handler for old AM client</param>
        /// <param name="connectionClient">handler for right holder client</param>  
        public UserService(
            ILogger<IAPIDelegationService> logger,
            IProfileClient profileClient,
            IAccessManagementClient accessManagementClient,
            IAccessManagementClientV0 accessManagementClientV0,
            IConnectionClient connectionClient)
        {
            _logger = logger;
            _profileClient = profileClient;
            _accessManagementClient = accessManagementClient;
            _accessManagementClientV0 = accessManagementClientV0;
            _connectionClient = connectionClient;
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
        public async Task<List<AuthorizedParty>> GetReporteeListForUser(Guid userUuid)
        {
            UserProfile userProfile;
            try
            {
                userProfile = await _profileClient.GetUserProfile(userUuid);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user profile: {ex.Message}");
                userProfile = null;
            }

            List<AuthorizedParty> parties = await _accessManagementClientV0.GetReporteeListForUser(userProfile?.ProfileSettingPreference?.ShowClientUnits ?? false);
            return parties;
        }

        /// <inheritdoc/>
        public async Task<List<Connection>> GetActorListForUser(Guid authenticatedUserPartyUuid)
        {
            List<Connection> connections = await _connectionClient.GetConnections(authenticatedUserPartyUuid, null, authenticatedUserPartyUuid);
            return connections;
        }

        /// <inheritdoc/>
        public async Task<List<string>> GetFavoriteActorUuids()
        {
            ProfileGroup favoriteProfileGroup = await _profileClient.GetFavoriteProfileGroup();
            return favoriteProfileGroup?.Parties;
        }

        /// <inheritdoc/>
        public async Task AddPartyUuidToFavorites(Guid partyUuid)
        {
            await _profileClient.AddPartyUuidToFavorites(partyUuid);
        }

        /// <inheritdoc/>
        public async Task DeletePartyUuidFromFavorites(Guid partyUuid)
        {
            await _profileClient.DeletePartyUuidFromFavorites(partyUuid);
        }

        /// <inheritdoc/>
        public async Task<List<User>> GetReporteeList(Guid partyUuid)
        {
            List<AuthorizedParty> rightOwners = await _accessManagementClient.GetReporteeList(partyUuid);

            return rightOwners.Select(party => new User(party)).ToList();
        }
    }
}
