using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;

namespace Altinn.AccessManagement.UI.Tests.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IMaskinportenSchemaClient"></see> interface
    /// </summary>
    public class MaskinportenSchemaClientMock : IMaskinportenSchemaClient
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenSchemaClientMock"/> class
        /// </summary>
        public MaskinportenSchemaClientMock()
        {
        }

        public Task<List<MaskinportenSchemaDelegation>> GetReceivedMaskinportenSchemaDelegations(string party)
        {
            List<MaskinportenSchemaDelegation> delegations = new List<MaskinportenSchemaDelegation>();
            List<MaskinportenSchemaDelegation> filteredDelegations = new List<MaskinportenSchemaDelegation>();

            string path = GetDataPathForDelegations();
            if (Directory.Exists(path))
            {
                string file = "inbounddelegation.json";
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                
                string content = File.ReadAllText(Path.Combine(path, file));
                delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options);

                
                if (!string.IsNullOrEmpty(party))
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.CoveredByPartyId == Convert.ToInt32(party)));
                }
            }

            return Task.FromResult(filteredDelegations);
        }

        public Task<List<MaskinportenSchemaDelegation>> GetOfferedMaskinportenSchemaDelegations(string party)
        {
            List<MaskinportenSchemaDelegation> delegations = new List<MaskinportenSchemaDelegation>();
            List<MaskinportenSchemaDelegation> filteredDelegations = new List<MaskinportenSchemaDelegation>();

            string path = GetDataPathForDelegations();
            if (Directory.Exists(path))
            {
                string file = "outbounddelegation.json";
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                string content = File.ReadAllText(Path.Combine(path, file));
                delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options);


                if (!string.IsNullOrEmpty(party))
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.OfferedByPartyId == Convert.ToInt32(party)));
                }
            }

            return Task.FromResult(filteredDelegations);
        }

        private static string GetDataPathForDelegations()
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "Delegation");
        }

        public Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation)
        {
            throw new NotImplementedException();
        }

        public Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegation delegation)
        {
            throw new NotImplementedException();
        }

        public Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation)
        {
            throw new NotImplementedException();
        }
    }
}
