using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Altinn.AccessManagement.UI.Mocks.Utils
{
    public static class Util
    {
        public static T GetMockData<T>(string fullPath)
        {
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

        public static StreamContent GetRequestWithHeader(string filePath)
        {
            Stream dataStream = File.OpenRead(filePath);
            StreamContent content = new StreamContent(dataStream);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return content;
        }
        public static Task<HttpResponseMessage> GetMockedHttpResponse(string path, string resourceFileName)
        {
            try
            {
                string data = GetMockDataSerialized(path, resourceFileName + ".json");
                return Task.FromResult(new HttpResponseMessage { StatusCode = HttpStatusCode.OK, Content = new StringContent(data) });
            }
            catch
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
        }

        // A helper for testing handling of exceptions in clients
        public static void ThrowExceptionIfTriggerParty(string id)
        {
            if (id == "********" || id == "00000000-0000-0000-0000-000000000000")
            {
                throw new Exception();
            }
        }
    }
}
