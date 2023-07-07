using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Mocks.Mocks;

namespace Altinn.AccessManagement.UI.Mocks.Utils
{
    public static class ResourceUtil
    {
        public static OrgList GetMockedResourceRegistryOrgList()
        {
            string unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceClientMock).Assembly.Location).LocalPath);
            string path = Path.Combine(unitTestFolder, "Data", "ResourceRegistry");
            string filename = "resourceowners";

            string content = File.ReadAllText(Path.Combine(path, $"{filename}.json"));
            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            OrgList res = JsonSerializer.Deserialize<OrgList>(content, options);
            return res;
        }
    }
}
