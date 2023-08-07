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
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(SingleRightClientMock).Assembly.Location).LocalPath);
            string path = Path.Combine(unitTestFolder, "Data", "SingleRight", "DelegationAccessCheckResponse");

            List<DelegationAccessCheckResponse> expectedResponse = Util.GetMockData<List<DelegationAccessCheckResponse>>(path, DetermineAccessLevel(request));

            return Task.FromResult(expectedResponse);
        }

        private static string DetermineAccessLevel(DelegationRequestDto request)
        {
            string value = request.Resource.FirstOrDefault().Value;

            switch (value)
            {
                case "appid-504":
                    return "NoAccessesAppid504.json";
                case "appid-505":
                    return "OnlyReadAppid505.json";
                case "appid-506":
                    return "ReadAndWriteAppid506.json";
                case "appid-503":
                    return "AllAccessesAppid503.json";
                default:
                    return "AllAccessesAppid503.json";
            }
        }
    }
}
