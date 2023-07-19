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
            List<DelegationAccessCheckResponse> expectedResponse = SingleRightUtil.GetMockedDelegationAccessCheckResponses(DetermineFilePath(request));

            return Task.FromResult(expectedResponse);
        }

        private AccessLevel DetermineFilePath(DelegationRequestDto request)
        {
            if (request.Resource.FirstOrDefault().Value == "appid-504")
            {
                return AccessLevel.NoAccessesAppid504;
            }
            if (request.Resource.FirstOrDefault().Value == "appid-505")
            {
                return AccessLevel.OnlyReadAppid505;
            }
            if (request.Resource.FirstOrDefault().Value == "appid-506")
            {
                return AccessLevel.ReadAndWriteAppid506;
            }
            if (request.Resource.FirstOrDefault().Value == "appid-503")
            {
                return AccessLevel.AllAccessesAppid503;
            }
            return AccessLevel.AllAccessesAppid503;
        }
    }
}
