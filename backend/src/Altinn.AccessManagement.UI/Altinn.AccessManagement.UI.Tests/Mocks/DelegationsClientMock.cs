using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Integration.Clients;

namespace Altinn.AccessManagement.UI.Tests.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IDelegationsClient"></see> interface
    /// </summary>
    public class DelegationsClientMock : IDelegationsClient
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationsClientMock"/> class
        /// </summary>
        public DelegationsClientMock()
        {
        }

        /// <inheritdoc/>
        public async Task<ServiceResource> GetResource(string resourceId)
        {
            ServiceResource resource = null;
            string rolesPath = GetResourcePath(resourceId);
            if (File.Exists(rolesPath))
            {
                string content = File.ReadAllText(rolesPath);
                resource = (ServiceResource)JsonSerializer.Deserialize(content, typeof(ServiceResource), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            return await Task.FromResult(resource);
        }

        /// <inheritdoc/>
        public Task<List<ServiceResource>> GetResources()
        {
            List<ServiceResource> resources = new List<ServiceResource>();

            string path = GetDataPathForResources();
            if (Directory.Exists(path))
            {
                string[] files = Directory.GetFiles(path);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                foreach (string file in files)
                {
                    if (file.Contains("resources"))
                    {
                        string content = File.ReadAllText(Path.Combine(path, file));
                        resources = JsonSerializer.Deserialize<List<ServiceResource>>(content, options);
                    }
                }
            }

            return Task.FromResult(resources);
        }

        public Task<List<Delegation>> GetInboundDelegations(string party)
        {
            List<Delegation> delegations = new List<Delegation>();
            List<Delegation> filteredDelegations = new List<Delegation>();

            string path = GetDataPathForDelegations();
            if (Directory.Exists(path))
            {
                string file = "inbounddelegation.json";
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                //foreach (string file in files)
                //{
                    //if (file.Contains("inbound"))
                    //{
                        string content = File.ReadAllText(Path.Combine(path, file));
                delegations = JsonSerializer.Deserialize<List<Delegation>>(content, options);

                
                if (!string.IsNullOrEmpty(party))
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.CoveredByPartyId == Convert.ToInt32(party)));
                }
                //}
                //}
            }

            return Task.FromResult(filteredDelegations);
        }

        public Task<List<Delegation>> GetOutboundDelegations(string party)
        {
            List<Delegation> delegations = new List<Delegation>();
            List<Delegation> filteredDelegations = new List<Delegation>();

            string path = GetDataPathForDelegations();
            if (Directory.Exists(path))
            {
                string file = "outbounddelegation.json";
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                string content = File.ReadAllText(Path.Combine(path, file));
                delegations = JsonSerializer.Deserialize<List<Delegation>>(content, options);


                if (!string.IsNullOrEmpty(party))
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.OfferedByPartyId == Convert.ToInt32(party)));
                }
            }

            return Task.FromResult(filteredDelegations);
        }

        private static string GetResourcePath(string resourceRegistryId)
        {
            string unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "..", "..", "..", "Data", "ResourceRegistryResources", $"{resourceRegistryId}", "resource.json");
        }

        private static string GetDataPathForDelegations()
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "Delegation");
        }

        private static string GetDataPathForResources()
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "Resources");
        }

        public Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation)
        {
            throw new NotImplementedException();
        }

        public Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation)
        {
            throw new NotImplementedException();
        }

        public Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation)
        {
            throw new NotImplementedException();
        }
    }
}
