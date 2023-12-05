using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;

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
        public Task<List<DelegationResponseData>> CheckDelegationAccess(string partyId, Right request)
        {
            string resourceFileName = GetMockDataFilename(request.Resource);
            string path = Path.Combine(localPath, "Data", "SingleRight", "DelegationAccessCheckResponse", resourceFileName+".json");

            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(path);

            return Task.FromResult(expectedResponse);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation)
        {
            string resourceFileName = GetMockDataFilename(delegation.Rights.First().Resource);
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

        private static string GetMockDataFilename(List<IdValuePair> resourceReference)
        {
            IdValuePair referencePart = resourceReference.First();

            switch (referencePart.Id)
            {
                case "urn:altinn:resource":
                case "urn:altinn:servicecode":
                case "urn:altinn:app":
                    return referencePart.Value;
                case "urn:altinn:org":
                case "urn:altinn:serviceeditioncode":
                    return resourceReference[1].Value;
                default:
                    return "Unknown";
            }
        }
    }
}
