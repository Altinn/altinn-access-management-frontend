using System.CodeDom.Compiler;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Common.PEP.Configuration;
using Altinn.Platform.Register.Models;
using Bogus;
using Bogus.Extensions.Norway;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessManagementClient"></see> interface
    /// </summary>
    public class AccessManagementClientMock : IAccessManagementClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string dataFolder;
        private Faker<AuthorizedParty> _faker;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public AccessManagementClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
            setUpAuthorizedPartyFaker();
        }

        /// <inheritdoc />
        public Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId)
        {
            try
            {
                return Task.FromResult(Util.GetMockData<AuthorizedParty>(Path.Combine(dataFolder, "ReporteeList", partyId + ".json")));
            }
            catch (FileNotFoundException)
            {

                return Task.FromResult<AuthorizedParty>(null);
            }

        }

        /// <inheritdoc />
        public Task<List<AuthorizedParty>> GetReporteeRightHolders(int partyId)
        {
            if (partyId == 51329012)
            {
                // Use static mock data
                return Task.FromResult(Util.GetMockData<List<AuthorizedParty>>(Path.Combine(dataFolder, "RightHolders", partyId + ".json")));
            }
            else
            {
                // Use automatically generated data
                List<AuthorizedParty> reportees = _faker.Generate(3000);
                AuthorizedParty currentUser = new AuthorizedParty
                {
                    PartyId = 51194376,
                    Name = "Livsglad Film",
                    Type = AuthorizedPartyType.Person,
                    PartyUuid = new Guid("eb0e874b-5f37-44cc-b648-f9a902a82c89"),
                    AuthorizedRoles = []
                };
                reportees.Add(currentUser);
                return Task.FromResult(reportees);
            }
        }

        /// <inheritdoc />
        public async Task<RightHolderAccesses> GetRightHolderAccesses(string reporteeUuid, string rightHolderUuid)
        {
            try
            {
                string dataPath = Path.Combine(dataFolder, "RightHolders", "RightHolderAccess", $"{rightHolderUuid}.json");
                return await Task.FromResult(Util.GetMockData<RightHolderAccesses>(dataPath));
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
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
            string path = Path.Combine(dataFolder, "SingleRight", "DelegationAccessCheckResponse");

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
        public async Task<HttpResponseMessage> GetSingleRightsForRightholder(string party, string userId)
        {

            ThrowExceptionIfTriggerParty(party);

            string dataPath = Path.Combine(dataFolder, "SingleRight", "GetDelegations");

            return await Util.GetMockedHttpResponse(dataPath, "delegations");
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeResourceDelegation(string from, string to, string resourceId)
        {
            ThrowExceptionIfTriggerParty(from);

            string dataPath = Path.Combine(dataFolder, "SingleRight", "RevokeDelegation");

            var mockResponse = await Util.GetMockedHttpResponse(dataPath, resourceId);
            if (mockResponse.IsSuccessStatusCode)
            {
                return mockResponse;
            }
            throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", mockResponse.StatusCode, "");
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeRightDelegation(string from, string to, string resourceId, string rightKey)
        {
            string dataPath = Path.Combine(dataFolder, "SingleRight", "RevokeDelegation");

            var mockResponse = await Util.GetMockedHttpResponse(dataPath, rightKey);
            if (mockResponse.IsSuccessStatusCode)
            {
                return mockResponse;
            }
            throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", mockResponse.StatusCode, "");
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> DelegateResourceRights(string from, string to, string resourceId, List<string> rightKeys)
        {
            ThrowExceptionIfTriggerParty(from);

            string dataPath = Path.Combine(dataFolder, "SingleRight", "CreateDelegation");

            var mockResponse = await Util.GetMockedHttpResponse(dataPath, resourceId);
            if (mockResponse.IsSuccessStatusCode)
            {
                return mockResponse;
            }
            throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", mockResponse.StatusCode, "");
        }

        //// Access packages

        /// <inheritdoc />
        public async Task<List<AccessPackageAccess>> GetAccessPackageAccesses(string to, string from, string languageCode)
        {
            ThrowExceptionIfTriggerParty(from);

            try
            {
                string dataPath = Path.Combine(dataFolder, "AccessPackage", "GetDelegations", $"{to}.json");
                return await Task.FromResult(Util.GetMockData<List<AccessPackageAccess>>(dataPath));
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> CreateAccessPackageDelegation(string party, DelegationInput input)
        {
            ThrowExceptionIfTriggerParty(party);

            string packageId = input.Rights.First().Resource.First().Value;
            
            if (packageId == Guid.Empty.ToString())
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            else
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.Created));
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

        // A helper for testing handling of exceptions in client
        private static void ThrowExceptionIfTriggerParty(string id)
        {
            if (id == "********" || id == "00000000-0000-0000-0000-000000000000")
            {
                throw new Exception();
            }
        }

        private void setUpAuthorizedPartyFaker()
        {
            List<AuthorizedPartyType> allowedPartyTypes = Enum.GetValues(typeof(AuthorizedPartyType)).Cast<AuthorizedPartyType>().Where(type => type != AuthorizedPartyType.None && type != AuthorizedPartyType.SelfIdentified).ToList();

            var subunitFaker = new Faker<AuthorizedParty>()
                .RuleFor(s => s.Type, AuthorizedPartyType.Person)
                .RuleFor(s => s.Name, f => f.Person.FullName)
                .RuleFor(s => s.PartyId, f => f.Random.Number(10000000, 99999999))
                .RuleFor(s => s.PartyUuid, f => f.Random.Guid())
                .RuleFor(s => s.AuthorizedRoles, f => f.Make(f.Random.Number(0, 5), () => f.PickRandom<RegistryRoleType>().ToString()).Distinct().ToList());

            _faker = new Faker<AuthorizedParty>()
                .RuleFor(p => p.PartyUuid, f => f.Random.Guid())
                .RuleFor(p => p.Type, f => f.PickRandom(allowedPartyTypes))
                .RuleFor(p => p.OrganizationNumber, (f, p) => p.Type == AuthorizedPartyType.Organization ? f.Random.Number(100000000, 999999999).ToString() : null)
                .RuleFor(p => p.PartyId, f => f.Random.Number(10000000, 99999999))
                .RuleFor(p => p.Name, (f, p) => p.Type == AuthorizedPartyType.Organization ? f.Company.CompanyName() : f.Person.FullName)
                .RuleFor(p => p.UnitType, (f, p) => p.Type == AuthorizedPartyType.Organization ? f.Company.CompanySuffix() : null)
                .RuleFor(p => p.AuthorizedRoles, f => f.Make(f.Random.Number(0, 5), () => f.PickRandom<RegistryRoleType>().ToString()).Distinct().ToList())
                .RuleFor(p => p.Subunits, (f, p) =>
                {
                    if (p.Type == AuthorizedPartyType.Organization)
                    {
                        return subunitFaker.Generate(f.Random.Number(1, 5));
                    }
                    return new List<AuthorizedParty>();
                });
        }





    }
}
