using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IPartiesClient"></see> interface
    /// </summary>
    public class RegisterClientMock : IRegisterClient
    {
        private static int _numberOfFaliedPersonLookups = 0;
        private static readonly JsonSerializerOptions _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterClientMock"/> class
        /// </summary>
        /// <param name="httpClient">http client</param>
        public RegisterClientMock(HttpClient httpClient)
        {
        }
        public RegisterClientMock() { }

        /// <inheritdoc/>
        public Task<Party> GetPartyForOrganization(string organizationNumber)
        {
            Party party = null;
            string testDataPath = Path.Combine(Path.GetDirectoryName(new Uri(typeof(RegisterClientMock).Assembly.Location).LocalPath), "Data", "Register", "Parties", "parties.json");
            if (File.Exists(testDataPath))
            {
                string content = File.ReadAllText(testDataPath);
                List<Party> partyList = JsonSerializer.Deserialize<List<Party>>(content);
                party = partyList?.FirstOrDefault(p => p.Organization?.OrgNumber == organizationNumber);
            }

            return Task.FromResult(party);
        }

        /// <inheritdoc/>
        public Task<List<Party>> GetPartyList(List<Guid> uuidList)
        {
            string testDataPath = Path.Combine(Path.GetDirectoryName(new Uri(typeof(RegisterClientMock).Assembly.Location).LocalPath), "Data", "Register", "Parties", "parties.json");
            if (File.Exists(testDataPath))
            {
                string content = File.ReadAllText(testDataPath);
                List<Party> partyList = JsonSerializer.Deserialize<List<Party>>(content, options);
                return Task.FromResult(new List<Party>() { partyList?.FirstOrDefault(p => p.PartyUuid == uuidList[0]) });
            }

            return Task.FromResult(new List<Party> { });
        }

        /// <inheritdoc/>
        public async Task<Person> GetPerson(string ssn, string lastname)
        {
            Person person = null;
            string testDataPath = Path.Combine(Path.GetDirectoryName(new Uri(typeof(RegisterClientMock).Assembly.Location).LocalPath), "Data", "Register", "Persons", $"{ssn}.json");
            if (File.Exists(testDataPath))
            {
                string content = File.ReadAllText(testDataPath);
                Person personContent = JsonSerializer.Deserialize<Person>(content, _options);
                if (personContent.LastName.ToLower() == lastname.ToLower())
                {
                    person = personContent;
                }
            }

            if (person == null)
            {
                _numberOfFaliedPersonLookups++;
                if (_numberOfFaliedPersonLookups > 3)
                {
                    throw new HttpStatusException("Status Error", "Too many failed person lookups", HttpStatusCode.TooManyRequests, null);
                }
                else
                {
                    throw new HttpStatusException("Status Error", "Person not found", HttpStatusCode.NotFound, null);
                }
            }
            return await Task.FromResult(person);
        }

        /// <inheritdoc/>
        public async Task<Party> GetPartyForPerson(string ssn)
        {
            Party party = null;
            string testDataPath = Path.Combine(Path.GetDirectoryName(new Uri(typeof(RegisterClientMock).Assembly.Location).LocalPath), "Data", "Register", "Parties", "parties.json");
            if (File.Exists(testDataPath))
            {
                string content = File.ReadAllText(testDataPath);
                List<Party> partyList = JsonSerializer.Deserialize<List<Party>>(content, _options);
                party = partyList?.FirstOrDefault(p => p.SSN == ssn);
            }
            else
            {
                throw new HttpStatusException("Status Error", "Party not found", HttpStatusCode.NotFound, null);
            }

            return await Task.FromResult(party);
        }
        public Task<List<PartyName>> GetPartyNames(IEnumerable<string> orgNumbers, CancellationToken cancellationToken)
        {
            string testDataPath = Path.Combine(Path.GetDirectoryName(new Uri(typeof(RegisterClientMock).Assembly.Location).LocalPath), "Data", "Register", "Parties", "parties.json");
            if (File.Exists(testDataPath))
            {
                string content = File.ReadAllText(testDataPath);
                List<Party> partyList = JsonSerializer.Deserialize<List<Party>>(content, _options);
                List<PartyName> partyNames = partyList?.Where(party => orgNumbers.Contains(party.OrgNumber)).Select(p =>
                {
                    return new PartyName
                    {
                        OrgNo = p.Organization?.OrgNumber,
                        Name = p.Organization?.Name,
                        Ssn = p.SSN
                    };
                }).ToList();
                return Task.FromResult(partyNames);
            }

            return Task.FromResult(new List<PartyName> { });
        }
    }
}
