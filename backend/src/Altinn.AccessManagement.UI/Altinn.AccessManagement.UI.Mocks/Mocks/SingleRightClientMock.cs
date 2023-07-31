using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    public class SingleRightClientMock : ISingleRightClient
    {
        /// <summary>
        ///     Initializes a new instance of <see cref="SingleRightClientMock" /> class
        /// </summary>
        public SingleRightClientMock()
        {

        }

        /// <inheritdoc />
        public Task<List<DelegationAccessCheckResponse>> CheckDelegationAccess(string partyId, DelegationRequestDto request)
        {
            List<DelegationAccessCheckResponse> expectedResponse = SingleRightUtil.GetMockedDelegationAccessCheckResponses(DetermineAccessLevel(request));

            return Task.FromResult(expectedResponse);
        }

        private static AccessLevel DetermineAccessLevel(DelegationRequestDto request)
        {
            string value = request.Resource.FirstOrDefault().Value;

            switch (value)
            {
                case "appid-504":
                    return AccessLevel.NoAccessesAppid504;
                case "appid-505":
                    return AccessLevel.OnlyReadAppid505;
                case "appid-506":
                    return AccessLevel.ReadAndWriteAppid506;
                case "appid-503":
                    return AccessLevel.AllAccessesAppid503;
                default:
                    return AccessLevel.AllAccessesAppid503;
            }
        }
    }
}
