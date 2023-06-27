using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IPartiesClient"></see> interface
    /// </summary>
    public class RegisterClientMock : IRegisterClient
    {
        /// <inheritdoc/>
        public Task<Party> GetPartyForOrganization(string organizationNumber)
        {
            Party party = null;
            string testDataPath = Path.Combine(Path.GetDirectoryName(new Uri(typeof(RegisterClientMock).Assembly.Location).LocalPath), "Data", "Register", "Parties", "parties.json"); ;
            if (File.Exists(testDataPath))
            {
                string content = File.ReadAllText(testDataPath);
                List<Party>? partyList = JsonSerializer.Deserialize<List<Party>>(content);

                party = partyList?.FirstOrDefault(p => p.Organization?.OrgNumber == organizationNumber);
            }

            return Task.FromResult(party);
        }
    }
}
