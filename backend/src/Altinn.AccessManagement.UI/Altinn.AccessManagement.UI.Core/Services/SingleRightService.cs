using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly IAccessManagementClient _accessManagementClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightService" /> class.
        /// </summary>
        public SingleRightService(IAccessManagementClient accessManagementClient)
        {
            _accessManagementClient = accessManagementClient;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CheckDelegationAccess(string partyId, Right request)
        {
            return await _accessManagementClient.CheckSingleRightsDelegationAccess(partyId, request);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation)
        {
            return await _accessManagementClient.CreateSingleRightsDelegation(party, delegation);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient)
        {
            return await _accessManagementClient.ClearAccessCacheOnRecipient(party, recipient);
        }
    }
}
