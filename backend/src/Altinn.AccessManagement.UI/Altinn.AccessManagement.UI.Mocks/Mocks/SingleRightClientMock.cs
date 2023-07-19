using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    public class SingleRightClientMock : ISingleRightClient
    {
        /// <summary>
        ///     Initializes a new instance of <see cref="SingleRightMockClient" /> class
        /// </summary>
        public SingleRightClientMock()
        {

        }

        /// <inheritdoc />
        public Task<List<DelegationAccessCheckResponse>> CheckDelegationAccess(string partyId, DelegationRequestDto request)
        {
            List<DelegationAccessCheckResponse> expectedResponse = SingleRightUtil.GetMockedDelegationAccessCheckResponses(ChooseRandomAccessLevel());

            return Task.FromResult(expectedResponse);
        }

        private AccessLevel ChooseRandomAccessLevel()
        {
            Random random = new Random();
            AccessLevel randomAccessLevel = (AccessLevel)random.Next(1, 6);
            return randomAccessLevel;
        }
    }
}
