using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly ISingleRightClient _singleRightClient;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SingleRightMockClient" /> class
        /// </summary>
        public SingleRightService(ISingleRightClient singleRightClient)
        {
            _singleRightClient = singleRightClient;
        }

        /// <inheritdoc />
        public async Task<List<DelegationAccessCheckResponse>> CheckDelegationAccess(string partyId, CheckDelegationAccessDto request)
        {
            return await _singleRightClient.CheckDelegationAccess(partyId, request);
        }
    }
}
