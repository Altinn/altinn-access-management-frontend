using System.Data;
using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Bogus;
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
                return Task.FromResult(Util.GetMockData<AuthorizedParty>(Path.Combine(dataFolder, "ReporteeList", "GetPartyFromReporteeList", partyId + ".json")));
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
        public Task<List<AuthorizedParty>> GetReporteeList(Guid partyId)
        {
            try
            {
                return Task.FromResult(Util.GetMockData<List<AuthorizedParty>>(Path.Combine(dataFolder, "ReporteeList", "reporteeList.json")));
            }
            catch (FileNotFoundException)
            {

                return Task.FromResult<List<AuthorizedParty>>(null);
            }
        }

        /// <inheritdoc />
        public async Task<UserAccesses> GetUserAccesses(Guid from, Guid to)
        {
            try
            {
                string dataPath = Path.Combine(dataFolder, "RightHolders", "UserAccesses", $"{from}_{to}.json");
                return await Task.FromResult(Util.GetMockData<UserAccesses>(dataPath));
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        //// Roles

        public Task<List<Role>> GetRoleSearchMatches(string languageCode, string searchString)
        {
            List<Role> allRoles = Util.GetMockData<List<Role>>($"{dataFolder}/Roles/roles_old.json");
            return searchString != null ? Task.FromResult(allRoles.Where(role => role.Name.ToLower().Contains(searchString.ToLower())).ToList()) : Task.FromResult(allRoles);
        }

        /// <inheritdoc />    
        public Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid)
        {
            if (rightHolderUuid == Guid.Empty)
            {
                throw new Exception("Right holder uuid is not valid");
            }
            try
            {
                List<RoleAssignment> allAssignments = Util.GetMockData<List<RoleAssignment>>($"{dataFolder}/Roles/GetRolesForUser/{rightHolderUuid}.json");
                if (allAssignments == null)
                {
                    return Task.FromResult(new List<RoleAssignment>());
                }
                return Task.FromResult(allAssignments);
            }
            catch
            {
                return Task.FromResult(new List<RoleAssignment>());
            }
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> CreateRoleDelegation(Guid from, Guid to, Guid roleId)
        {
            if (to == Guid.Empty)
            {
                throw new Exception("Right holder uuid is not valid");
            }
            // Mocking delegate error - role "Kundeadministrator"
            if (roleId.ToString() == "3abe9842-06a5-483f-b76d-a65dec152b2d")
            {
                throw new Exception("Assignment id is not valid");
            }

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> DeleteRoleDelegation(Guid assignmentId)
        {
            if (assignmentId == Guid.Empty)
            {
                throw new Exception("Right holder uuid is not valid");
            }
            // Mocking revoke error - role "Kundeadministrator" for user "medaljong sitrongul"
            if (assignmentId.ToString() == "5e9700d8-1d03-4665-8ce0-13a028741938")
            {
                throw new Exception("Assignment id is not valid");
            }

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
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
