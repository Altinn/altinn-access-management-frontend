using System.Text.Json;

namespace Altinn.AccessManagement.UI.Mocks.Utils
{
    public static class ResourceUtil
    {
        public static T GetMockedData<T>(string path, string filename)
        {
            string content = File.ReadAllText(Path.Combine(path, $"{filename}.json"));
            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            T res = JsonSerializer.Deserialize<T>(content, options);
            return res;
        }
    }
}
