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
        private readonly ISingleRightClient _singleRightClient;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SingleRightService" /> class
        /// </summary>
        public SingleRightService(ISingleRightClient singleRightClient)
        {
            _singleRightClient = singleRightClient;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CheckDelegationAccess(string partyId, Right request)
        {
            return await _singleRightClient.CheckDelegationAccess(partyId, request);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation)
        {
            return await _singleRightClient.CreateDelegation(party, delegation);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient)
        {
            return await _singleRightClient.ClearAccessCacheOnRecipient(party, recipient);
        }
    }
}
