using System.Net;
using System.Text;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
        public async Task<HttpResponseMessage> CheckDelegationAccess(string partyId, Right request)
        {
            string resourceFileName = GetMockDataFilename(request.Resource);
            string path = Path.Combine(localPath, "Data", "SingleRight", "DelegationAccessCheckResponse");

            return await GetMockedHttpResponse(path, resourceFileName);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation)
        {
            string resourceFileName = GetMockDataFilename(delegation.Rights.First().Resource);
            string dataPath = Path.Combine(localPath, "Data", "SingleRight", "CreateDelegation");

            return await GetMockedHttpResponse(dataPath, resourceFileName);
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient)
        {
            return Task.FromResult(new HttpResponseMessage
            { StatusCode = HttpStatusCode.OK });
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

        private static Task<HttpResponseMessage> GetMockedHttpResponse(string path, string resourceFileName)
        {
            try
            {
                string data = Util.GetMockDataSerialized(path, resourceFileName + ".json");
                return Task.FromResult(new HttpResponseMessage { StatusCode = HttpStatusCode.OK, Content = new StringContent(data) });
            }
            catch
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
        }
    }
}
