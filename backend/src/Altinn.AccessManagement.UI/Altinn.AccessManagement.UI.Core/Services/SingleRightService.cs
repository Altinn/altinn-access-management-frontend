using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.ClientInterfaces.MockClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly ISingleRightClient _singleRightClient;
        private readonly ISingleRightMockClient _singleRightMockClient;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SingleRightMockClient" /> class
        /// </summary>
        public SingleRightService(ISingleRightClient singleRightClient, ISingleRightMockClient singleRightMockClient)
        {
            _singleRightClient = singleRightClient;
            _singleRightMockClient = singleRightMockClient;
        }

        /// <inheritdoc />
        public async Task<List<DelegationAccessCheckResponse>> CheckDelegationAccess(string partyId, CheckDelegationAccessDto request)
        {
            bool isMock = true;

            if (isMock)
            {
                return _singleRightMockClient.UserDelegationAccessCheck(partyId, request);
            }

            return await _singleRightClient.UserDelegationAccessCheck(partyId, request);
        }
    }
}
