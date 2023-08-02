using System.Text.Json;

namespace Altinn.AccessManagement.UI.Mocks.Utils
{
    public static class ResourceUtil
    {
        public static T GetMockedData<T>(string path, string filename)
        {
            string fullPath = Path.Combine(path, filename);

            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"The file with path {path} does not exist");
            }

            string content = File.ReadAllText(Path.Combine(fullPath));

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            T res = JsonSerializer.Deserialize<T>(content, options);
            return res;
        }
    }
}
