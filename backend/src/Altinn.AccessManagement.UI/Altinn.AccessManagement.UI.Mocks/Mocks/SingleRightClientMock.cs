using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Azure.Core;
using System.Net;
using System.Text;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    public class SingleRightClientMock : ISingleRightClient
    {

        private readonly string localPath;
        /// <summary>
        ///     Initializes a new instance of <see cref="SingleRightClientMock" /> class
        /// </summary>
        public SingleRightClientMock()
        {
            localPath = Path.GetDirectoryName(new Uri(typeof(SingleRightClientMock).Assembly.Location).LocalPath);
        }

        /// <inheritdoc />
        public Task<List<DelegationAccessCheckResponse>> CheckDelegationAccess(string partyId, DelegationRequestDto request)
        {
            string dataPath = Path.Combine(localPath, "Data", "SingleRight", "DelegationAccessCheckResponse");

            List<DelegationAccessCheckResponse> expectedResponse = Util.GetMockData<List<DelegationAccessCheckResponse>>(dataPath, DetermineAccessLevel(request));

            return Task.FromResult(expectedResponse);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation)
        {
            IdValuePair resource = delegation.Rights.First().Resource.First();

            string resourceFileName;
            switch (resource.Id) {
                case "urn:altinn:resource":
                case "urn:altinn:servicecode":
                case "urn:altinn:applicationid":
                    resourceFileName = resource.Value;
                    break;
                case "urn:altinn:org":
                case "urn:altinn:serviceeditioncode":
                    resourceFileName = delegation.Rights.First().Resource[1].Value;
                    break;
                default:
                    resourceFileName = "Unknown";
                    break;
            }

            string dataPath = Path.Combine(localPath, "Data", "SingleRight", "CreateDelegation");
            try
            {
                string data = Util.GetMockDataSerialized(dataPath, resourceFileName + ".json");
                return new HttpResponseMessage
                { StatusCode = HttpStatusCode.Created, Content = new StringContent(data) };

            }
            catch
            {
                return new HttpResponseMessage(HttpStatusCode.BadRequest);
            }
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
                case "appid-502":
                    return "OneAccessAppid502.json";
                default:
                    return "AllAccessesAppid503.json";
            }
        }
    }
}
