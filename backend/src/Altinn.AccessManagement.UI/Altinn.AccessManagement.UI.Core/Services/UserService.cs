using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
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
        private readonly IRightHolderClient _rightHolderClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="APIDelegationService"/> class.
        /// </summary>
        /// <param name="logger">handler for logger</param>
        /// <param name="profileClient">handler for profile client</param>
        /// <param name="accessManagementClient">handler for AM client</param>
        /// <param name="accessManagementClientV0">handler for old AM client</param>
        /// <param name="registerClient">handler for register client</param>
        /// <param name="rightHolderClient">handler for right holder client</param>  
        public UserService(
            ILogger<IAPIDelegationService> logger,
            IProfileClient profileClient,
            IAccessManagementClient accessManagementClient,
            IAccessManagementClientV0 accessManagementClientV0,
            IRegisterClient registerClient,
            IRightHolderClient rightHolderClient)
        {
            _logger = logger;
            _profileClient = profileClient;
            _accessManagementClient = accessManagementClient;
            _accessManagementClientV0 = accessManagementClientV0;
            _registerClient = registerClient;
            _rightHolderClient = rightHolderClient;
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
        public async Task<List<AuthorizedParty>> GetReporteeListForUser()
        {
            List<AuthorizedParty> parties = await _accessManagementClientV0.GetReporteeListForUser();
            return parties;
        }

        /// <inheritdoc/>
        public async Task<List<User>> GetReporteeRightHolders(int partyId)
        {
            List<AuthorizedParty> rightHolders = await _accessManagementClient.GetReporteeRightHolders(partyId);

            return rightHolders.Select(party => new User(party)).ToList();
        }

        /// <inheritdoc/>
        public async Task<List<User>> GetReporteeList(Guid partyUuid)
        {
            List<AuthorizedParty> rightOwners = await _accessManagementClient.GetReporteeList(partyUuid);

            return rightOwners.Select(party => new User(party)).ToList();
        }

        /// <inheritdoc/>
        public Task<UserAccesses> GetUserAccesses(Guid from, Guid to)
        {
            return _accessManagementClient.GetUserAccesses(from, to);
        }

        /// <inheritdoc/>
        public async Task<Guid?> ValidatePerson(string ssn, string lastname)
        {
            // Check for bad input
            string ssn_cleaned = ssn.Trim().Replace("\"", string.Empty);
            string lastname_cleaned = lastname.Trim().Replace("\"", string.Empty);
            if (ssn_cleaned.Length != 11 || !ssn_cleaned.All(char.IsDigit))
            {
                return null;
            }

            // Check that a person with the provided ssn and last name exists 
            Person person = await _registerClient.GetPerson(ssn_cleaned, lastname_cleaned);

            if (person == null)
            {
                return null;
            }

            Party personParty = await _registerClient.GetPartyForPerson(ssn_cleaned);

            return personParty?.PartyUuid;
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> RevokeRightHolder(Guid partyUuid, Guid rightHolderPartyUuid)
        {
            HttpResponseMessage response = await _accessManagementClient.RevokeRightHolder(partyUuid, rightHolderPartyUuid);
            return response;
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> AddReporteeRightHolder(Guid partyUuid, Guid rightholderPartyUuid)
        {
            return await _rightHolderClient.PostNewRightHolder(partyUuid, rightholderPartyUuid);
        }
    }
}
