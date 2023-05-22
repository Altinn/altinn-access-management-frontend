using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;

namespace Altinn.AccessManagement.UI.Tests.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IMaskinportenSchemaClient"></see> interface
    /// </summary>
    public class MaskinportenSchemaClientMock : IMaskinportenSchemaClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

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
                string content = File.ReadAllText(Path.Combine(path, "backendReceived.json"));
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
                string content = File.ReadAllText(Path.Combine(path, "backendOffered.json"));
                delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options);

                if (!string.IsNullOrEmpty(party))
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.OfferedByPartyId == Convert.ToInt32(party)));
                }
            }

            return Task.FromResult(filteredDelegations);
        }

        public Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation)
        {
            AttributeMatch resourceMatch = delegation.Rights.First().Resource.First();
            AttributeMatch fromMatch = delegation.From.First();

            string path = GetDataPathForDelegations();
            if (Directory.Exists(path))
            {
                string content = File.ReadAllText(Path.Combine(path, "backendReceived.json"));
                List<MaskinportenSchemaDelegation> delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options);

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
            AttributeMatch resourceMatch = delegation.Rights.First().Resource.First();
            AttributeMatch toMatch = delegation.To.First();

            string path = GetDataPathForDelegations();
            if (Directory.Exists(path))
            {
                string content = File.ReadAllText(Path.Combine(path, "backendOffered.json"));
                List<MaskinportenSchemaDelegation> delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options);

                foreach(MaskinportenSchemaDelegation d in delegations)
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
            AttributeMatch resourceMatch = delegation.Rights.First().Resource.First();
            AttributeMatch toMatch = delegation.To.First();
            string path = GetDataPathForDelegationOutput(resourceMatch.Value, party, toMatch.Value);
            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                return Task.FromResult(new HttpResponseMessage() { StatusCode = HttpStatusCode.Created, Content = new StringContent(content) });
            }

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
        }

        private static string GetDataPathForDelegations()
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "MaskinportenSchema");
        }       

        private static string GetDataPathForDelegationOutput(string resourceId, string from, string to, string responseFileName = "ExpectedOutput_Default")
        {
            return $"Data/MaskinportenSchema/Delegation/{resourceId}/from_p{from}/to_{to}/{responseFileName}.json";            
        }
    }
}
