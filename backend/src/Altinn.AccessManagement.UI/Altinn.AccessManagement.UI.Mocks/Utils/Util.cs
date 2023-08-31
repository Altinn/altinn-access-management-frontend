using System.Text.Json;

namespace Altinn.AccessManagement.UI.Mocks.Utils
{
    public static class Util
    {
        public static T GetMockData<T>(string path, string filename)
        {
            string fullPath = Path.Combine(path, filename);

            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"The file with path {fullPath} does not exist");
            }

            string content = File.ReadAllText(Path.Combine(fullPath));

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            T res = JsonSerializer.Deserialize<T>(content, options);
            return res;
        }

        public static string GetMockDataSerialized(string path, string filename)
        {
            string fullPath = Path.Combine(path, filename);

            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"The file with path {fullPath} does not exist");
            }

            return File.ReadAllText(Path.Combine(fullPath));

        }
    }
}
