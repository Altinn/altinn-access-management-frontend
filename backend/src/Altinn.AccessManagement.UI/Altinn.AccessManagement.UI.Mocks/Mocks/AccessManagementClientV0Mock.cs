﻿using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Principal;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Mocks.Utils;
using AltinnCore.Authentication.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessManagementClient"></see> interface
    /// </summary>
    public class AccessManagementClientV0Mock : IAccessManagementClientV0
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string dataFolder;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public AccessManagementClientV0Mock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId)
        {
            try
            {
                return Task.FromResult(Util.GetMockData<AuthorizedParty>(Path.Combine(dataFolder, "ReporteeList", "GetPartyFromReporteeList", partyId + ".json")));
            }
            catch (FileNotFoundException)
            {

                return Task.FromResult<AuthorizedParty>(null);
            }

        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient)
        {
            return Task.FromResult(new HttpResponseMessage
            { StatusCode = HttpStatusCode.OK });
        }

        //// MaskinportenSchema

        public Task<List<MaskinportenSchemaDelegation>> GetReceivedMaskinportenSchemaDelegations(string party)
        {
            ThrowExceptionIfTriggerParty(party);

            List<MaskinportenSchemaDelegation> delegations = new List<MaskinportenSchemaDelegation>();
            List<MaskinportenSchemaDelegation> filteredDelegations = new List<MaskinportenSchemaDelegation>();

            string path = Path.Combine(dataFolder, "MaskinportenSchema");
            if (Directory.Exists(path))
            {
                string content = File.ReadAllText(Path.Combine(path, "backendReceived.json"));
                delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options) ?? [];

                if (!string.IsNullOrEmpty(party))
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.CoveredByPartyId == Convert.ToInt32(party)));
                }
            }

            return Task.FromResult(filteredDelegations);
        }

        public Task<List<MaskinportenSchemaDelegation>> GetOfferedMaskinportenSchemaDelegations(string party)
        {
            ThrowExceptionIfTriggerParty(party);

            List<MaskinportenSchemaDelegation> delegations = new List<MaskinportenSchemaDelegation>();
            List<MaskinportenSchemaDelegation> filteredDelegations = new List<MaskinportenSchemaDelegation>();

            string path = Path.Combine(dataFolder, "MaskinportenSchema");
            if (Directory.Exists(path))
            {
                string content = File.ReadAllText(Path.Combine(path, "backendOffered.json"));
                delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options) ?? [];

                if (!string.IsNullOrEmpty(party))
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.OfferedByPartyId == Convert.ToInt32(party)));
                }
            }

            return Task.FromResult(filteredDelegations);
        }

        public Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation)
        {
            ThrowExceptionIfTriggerParty(party);

            IdValuePair resourceMatch = delegation.Rights.First().Resource.First();
            IdValuePair fromMatch = delegation.From.First();

            string path = Path.Combine(dataFolder, "MaskinportenSchema");
            if (Directory.Exists(path))
            {
                string content = File.ReadAllText(Path.Combine(path, "backendReceived.json"));
                List<MaskinportenSchemaDelegation> delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options) ?? [];
                foreach (MaskinportenSchemaDelegation d in delegations)
                {
                    if (d.CoveredByPartyId.ToString() == party &&
                        d.OfferedByOrganizationNumber == fromMatch.Value &&
                        d.ResourceId == resourceMatch.Value)
                    {
                        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NoContent));
                    }
                }
            }

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.InternalServerError));
        }

        public Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegation delegation)
        {
            ThrowExceptionIfTriggerParty(party);

            IdValuePair resourceMatch = delegation.Rights.First().Resource.First();
            IdValuePair toMatch = delegation.To.First();

            string path = Path.Combine(dataFolder, "MaskinportenSchema");
            if (Directory.Exists(path))
            {
                string content = File.ReadAllText(Path.Combine(path, "backendOffered.json"));

                List<MaskinportenSchemaDelegation> delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options) ?? [];
                foreach (MaskinportenSchemaDelegation d in delegations)
                {
                    if (d.OfferedByPartyId.ToString() == party &&
                        d.CoveredByOrganizationNumber == toMatch.Value &&
                        d.ResourceId == resourceMatch.Value)
                    {
                        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NoContent));
                    }
                }
            }

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.InternalServerError));
        }

        public Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation)
        {
            ThrowExceptionIfTriggerParty(party);

            string resourceId = delegation.Rights.First().Resource.First().Value;
            IdValuePair toMatch = delegation.To.First();
            string path = Path.Combine(dataFolder, "MaskinportenSchema", "Delegation", $"{resourceId}.json");
            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                return Task.FromResult(new HttpResponseMessage
                { StatusCode = HttpStatusCode.Created, Content = new StringContent(content) });
            }

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
        }

        /// <inheritdoc />
        public Task<List<DelegationResponseData>> MaskinportenSchemaDelegationCheck(string partyId, Right request)
        {
            string resourceId = request.Resource[0].Value;
            string filename;
            switch (resourceId)
            {
                case "appid-400":
                case "appid-136":
                    filename = resourceId;
                    break;
                default:
                    filename = "default";
                    break;
            }

            string fullPath = Path.Combine(dataFolder, "MaskinportenSchema", "DelegationCheck", filename + ".json");

            List<DelegationResponseData> mockedResponse = Util.GetMockData<List<DelegationResponseData>>(fullPath);

            return Task.FromResult(mockedResponse);
        }

        //// SingleRight

        public async Task<HttpResponseMessage> CheckSingleRightsDelegationAccess(string partyId, Right request)
        {
            ThrowExceptionIfTriggerParty(partyId);

            string resourceFileName = GetMockDataFilenameFromUrn(request.Resource);
            string path = Path.Combine(dataFolder, "SingleRight", "DelegationAccessCheckResponseV0");

            return await Util.GetMockedHttpResponse(path, resourceFileName);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateSingleRightsDelegation(string party, DelegationInput delegation)
        {
            string resourceFileName = GetMockDataFilenameFromUrn(delegation.Rights.First().Resource);
            string dataPath = Path.Combine(dataFolder, "SingleRight", "CreateDelegation");

            return await Util.GetMockedHttpResponse(dataPath, resourceFileName);
        }

        /// <inheritdoc />
        public Task<List<AuthorizedParty>> GetReporteeListForUser()
        {
            try
            {
                var token = GetTokenFromRequest();
                var handler = new JwtSecurityTokenHandler();
                var jwtSecurityToken = handler.ReadJwtToken(token);
                var partyId = jwtSecurityToken.Payload["urn:altinn:userid"].ToString();
                if (partyId == "500")
                {
                    throw new Exception("Internal Server Error");
                }
                return Task.FromResult(Util.GetMockData<List<AuthorizedParty>>(Path.Combine(dataFolder, "ReporteeList", $"{partyId}.json"))); 
            }
            catch (FileNotFoundException)
            {
                return Task.FromResult<List<AuthorizedParty>>(null);
            }
        }

        private static string GetMockDataFilenameFromUrn(List<IdValuePair> resourceReference)
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


        private string GetTokenFromRequest()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.Request.Headers.ContainsKey("Authorization"))
            {
                var token = httpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                return token;
            }
            return null;
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

