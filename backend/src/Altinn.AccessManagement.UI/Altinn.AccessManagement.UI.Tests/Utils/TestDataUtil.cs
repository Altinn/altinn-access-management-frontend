using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Tests.Controllers;

namespace Altinn.AccessManagement.UI.Tests.Utils
{
    /// <summary>
    /// Mock class for helping setup test data
    /// </summary>
    public static class TestDataUtil
    {
        /// <summary>
        /// Gets a list of service resources
        /// </summary>
        /// <param name="resourceType">the resource type.</param>
        /// <returns>Returns thelist of service resources.</returns>
        public static List<ServiceResource> GetResources(ResourceType resourceType)
        {
            List<ServiceResource> resources = new List<ServiceResource>();
            List<ServiceResource> filteredResources = null;

            string path = GetResourcesPath("resources");
            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                resources = JsonSerializer.Deserialize<List<ServiceResource>>(content, options);
            }

            filteredResources = resources.FindAll(r => r.ResourceType == resourceType);
            

            return filteredResources;
        }

        public static List<ServiceResourceFE> GetExpectedResources(ResourceType resourceType)
        {
            List<ServiceResourceFE> resources = new List<ServiceResourceFE>();
            List<ServiceResourceFE> filteredResources = null;

            string path = GetResourcesPath("resourcesfe");

            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                resources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(content, options);
            }

            filteredResources = resources.FindAll(r => r.ResourceType == resourceType);
           

            return filteredResources;
        }

        public static List<ServiceResourceFE> GetSingleRightsResources()
        {
            List<ServiceResourceFE> resources = new List<ServiceResourceFE>();
            List<ServiceResourceFE> filteredResources = null;

            string path = GetResourcesPath("resourcesfe");

            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                resources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(content, options);
            }

            filteredResources = resources.FindAll(r => r.ResourceType != ResourceType.MaskinportenSchema);


            return filteredResources;
        }

        /// <summary>
        /// Sets up mock data for delegation list 
        /// </summary>
        /// <param name="offeredByPartyId">partyid of the reportee that delegated the resource</param>
        /// <param name="coveredByPartyId">partyid of the reportee that received the delegation</param>
        /// <param name="resourceIds">resource id</param>
        /// <returns>Received delegations</returns>
        public static List<MaskinportenSchemaDelegation> GetDelegations(int offeredByPartyId, int coveredByPartyId, List<string> resourceIds = null)
        {
            List<MaskinportenSchemaDelegation> delegations = null;
            List<MaskinportenSchemaDelegation> filteredDelegations = new List<MaskinportenSchemaDelegation>();
            string fileName;

            if (resourceIds != null)
            {
                fileName = "admindelegations";
            }
            else
            {
                fileName = offeredByPartyId != 0 ? "outbounddelegation" : "inbounddelegation";
            }
            
            string path = GetDelegationPath();
            if (Directory.Exists(path))
            {
                string[] files = Directory.GetFiles(path);

                foreach (string file in files)
                {
                    if (file.Contains(fileName))
                    {
                        string content = File.ReadAllText(Path.Combine(path, file));
                        var options = new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true,
                        };
                        try
                        {
                            delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(content, options);
                        }
                        catch (Exception ex)
                        { 
                            Console.WriteLine(ex);
                        }
                    }
                }

                if (offeredByPartyId != 0 && coveredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations?.FindAll(od => od.OfferedByPartyId == offeredByPartyId && od.CoveredByPartyId == coveredByPartyId && resourceIds.Contains(od.ResourceId)));
                }
                else if (offeredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.OfferedByPartyId == offeredByPartyId));
                }
                else if (coveredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.CoveredByPartyId == coveredByPartyId));
                }
            }

            return filteredDelegations;
        }

        /// <summary>
        /// Sets up mock data for delegation list 
        /// </summary>
        /// <param name="offeredByPartyId">partyid of the reportee that delegated the resource</param>
        /// <param name="coveredByPartyId">partyid of the reportee that received the delegation</param>
        /// <param name="resourceIds">resource id</param>
        /// <returns>Received delegations</returns>
        public static List<MaskinportenSchemaDelegationFE> GetDelegationsFE(int offeredByPartyId, int coveredByPartyId, List<string> resourceIds = null)
        {
            List<MaskinportenSchemaDelegationFE> delegations = null;
            List<MaskinportenSchemaDelegationFE> filteredDelegations = new List<MaskinportenSchemaDelegationFE>();
            string fileName;

            if (resourceIds != null)
            {
                fileName = "admindelegations";
            }
            else
            {
                fileName = offeredByPartyId != 0 ? "frontendOffered" : "frontendReceived";
            }

            string path = GetDelegationPath();
            if (Directory.Exists(path))
            {
                string file = $"{fileName}.json";

                string content = File.ReadAllText(Path.Combine(path, file));
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                try
                {
                    delegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegationFE>>(content, options);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                }

                if (offeredByPartyId != 0 && coveredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations?.FindAll(od => od.OfferedByPartyId == offeredByPartyId && od.CoveredByPartyId == coveredByPartyId && resourceIds.Contains(od.ResourceId)));
                }
                else if (offeredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.OfferedByPartyId == offeredByPartyId));
                }
                else if (coveredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.CoveredByPartyId == coveredByPartyId));
                }
            }

            return filteredDelegations;
        }

        private static string GetDelegationPath()
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(MaskinportenSchemaControllerTest).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "MaskinportenSchema");
        }

        private static string GetResourcesPath(string fileName)
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(MaskinportenSchemaControllerTest).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "ResourceRegistry", $"{ fileName}.json");
        }
    }
}
