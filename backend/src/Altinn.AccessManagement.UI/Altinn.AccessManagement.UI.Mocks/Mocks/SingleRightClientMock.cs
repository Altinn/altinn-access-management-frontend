using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessPackageClient"></see> interface
    /// </summary>
    public class SingleRightClientMock : ISingleRightClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public SingleRightClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }


        /// <inheritdoc />
        public Task<ResourceCheckDto> GetDelegationCheck(Guid from, string resource)
        {
            ThrowExceptionIfTriggerParty(from.ToString());

            try
            {
                string dataPath = Path.Combine(dataFolder, "SingleRight", "DelegationCheck", $"{resource}.json");
                return Task.FromResult(Util.GetMockData<ResourceCheckDto>(dataPath));
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        /// <inheritdoc />
        public Task<List<ResourcePermission>> GetDelegatedResources(string languageCode, Guid party, Guid from, Guid to)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "SingleRight", "GetDelegations", "delegations.json");
            return Task.FromResult(Util.GetMockData<List<ResourcePermission>>(dataPath));
        }

        /// <inheritdoc />
        public Task<ResourceRight> GetDelegatedResourceRights(string languageCode, Guid party, Guid from, Guid to, string resource)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "SingleRight", "GetResourceRights", $"{resource}.json");
            return Task.FromResult(Util.GetMockData<ResourceRight>(dataPath));
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateSingleRightsAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys)
        {
            ThrowExceptionIfTriggerParty(from.ToString());

            try
            {
                string dataPath = Path.Combine(dataFolder, "SingleRight", "CreateDelegation", $"{resourceId}.json");
                string jsonResponse = await File.ReadAllTextAsync(dataPath);

                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateSingleRightsAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys)
        {
            ThrowExceptionIfTriggerParty(from.ToString());

            try
            {
                string dataPath = Path.Combine(dataFolder, "SingleRight", "CreateDelegation", $"{resourceId}.json");
                string jsonResponse = await File.ReadAllTextAsync(dataPath);

                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeResourceDelegation(Guid party, Guid from, Guid to, string resourceId)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "SingleRight", "RevokeDelegation");

            var mockResponse = await Util.GetMockedHttpResponse(dataPath, resourceId);
            if (mockResponse.IsSuccessStatusCode)
            {
                return mockResponse;
            }
            throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", mockResponse.StatusCode, "");
        }

        // A helper for testing handling of exceptions in client
        private static void ThrowExceptionIfTriggerParty(string id)
        {
            if (id == "********" || id == "00000000-0000-0000-0000-000000000000")
            {
                throw new Exception();
            }
        }
    }
}
