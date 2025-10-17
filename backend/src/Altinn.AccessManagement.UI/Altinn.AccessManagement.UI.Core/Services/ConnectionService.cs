using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Register.Models;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the delegation client. Processes and maps the required data to the frontend model
    /// </summary>
    public class ConnectionService : IConnectionService
    {
        private readonly ILogger _logger;
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IConnectionClient _connectionClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="APIDelegationService"/> class.
        /// </summary>
        /// <param name="logger">handler for logger</param>
        /// <param name="accessManagementClient">handler for AM client</param>
        /// <param name="registerClient">handler for register client</param>
        /// <param name="connectionClient">handler for right holder client</param>  
        public ConnectionService(
            ILogger<IAPIDelegationService> logger,
            IAccessManagementClient accessManagementClient,
            IRegisterClient registerClient,
            IConnectionClient connectionClient)
        {
            _logger = logger;
            _accessManagementClient = accessManagementClient;
            _registerClient = registerClient;
            _connectionClient = connectionClient;
        }

        /// <inheritdoc/>
        public async Task<List<User>> GetReporteeConnections(int partyId)
        {
            List<AuthorizedParty> rightHolders = await _accessManagementClient.GetReporteeRightHolders(partyId);

            return rightHolders.Select(party => new User(party)).ToList();
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
        public async Task<HttpResponseMessage> RevokeRightHolderConnection(Guid party, Guid? from, Guid? to)
        {
            HttpResponseMessage response = await _connectionClient.RevokeRightHolderConnection(party, from, to);
            return response;
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> AddReporteeRightHolderConnection(Guid partyUuid, Guid rightholderPartyUuid)
        {
            return await _connectionClient.PostNewRightHolderConnection(partyUuid, rightholderPartyUuid);
        }

        /// <inheritdoc/>
        public async Task<List<Connection>> GetConnections(Guid partyUuid, Guid? from, Guid? to)
        {
            try
            {
                return await _connectionClient.GetConnections(partyUuid, from, to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed fetching rightholders for {PartyUuid}", partyUuid);
                throw;
            }
        }
    }
}
