using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Tests.Utils
{
    /// <summary>
    ///     Mock class for helping setup test data
    /// </summary>
    public static class TestDataUtil
    {
        /// <summary>
        ///     Gets a list of service resources
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
                JsonSerializerOptions options = new JsonSerializerOptions
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
                JsonSerializerOptions options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                resources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(content, options);
            }

            filteredResources = resources.FindAll(r => r.ResourceType == resourceType);


            return filteredResources;
        }

        public static List<ServiceResourceFE> GetSingleRightsResources(bool includeExpired = false)
        {
            List<ServiceResourceFE> resources = new List<ServiceResourceFE>();

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

            return resources.FindAll(r =>
                r.ResourceType != ResourceType.MaskinportenSchema &&
                (includeExpired ||
                    (r.ResourceType != ResourceType.MigratedApp &&
                     r.Status?.ToLower() != "deprecated")));
        }

        private static string GetResourcesPath(string fileName)
        {
            string unitTestFolder = Path.GetDirectoryName(new Uri(typeof(TestDataUtil).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "ResourceRegistry", $"{fileName}.json");
        }
    }
}
