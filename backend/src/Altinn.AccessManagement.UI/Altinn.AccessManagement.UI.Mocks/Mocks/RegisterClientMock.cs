﻿using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IPartiesClient"></see> interface
    /// </summary>
    public class RegisterClientMock : IRegisterClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
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

        public Task<List<PartyName>> GetPartyNames(IEnumerable<string> orgNumbers, CancellationToken cancellationToken)
        {
            string testDataPath = Path.Combine(Path.GetDirectoryName(new Uri(typeof(RegisterClientMock).Assembly.Location).LocalPath), "Data", "Register", "Parties", "parties.json");
            if (File.Exists(testDataPath))
            {
                string content = File.ReadAllText(testDataPath);
                List<Party> partyList = JsonSerializer.Deserialize<List<Party>>(content, options);
                List<PartyName> partyNames = partyList?.Select(p => 
                {
                    return new PartyName { 
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
