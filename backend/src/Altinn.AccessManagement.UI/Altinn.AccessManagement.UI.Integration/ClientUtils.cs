using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Helpers;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Integration.Util
{
    /// <summary>
    /// Utils for use in clients
    /// </summary>
    public class ClientUtils
    {
        /// <summary>
        /// Deserializes the given response message into type T if the response has status OK, otherwise throws an HttpStatusException
        /// </summary>
        /// <typeparam name="T">The type that the response is to be deserialized into</typeparam>
        /// <param name="response">The response message that is to be deserialized</param>
        /// <param name="logger">The client logger to be used if errors are to be logged</param>
        /// <param name="clientMethodName">The client name and method name to be used in logging if a logger is provided</param>
        /// <returns>The response, deserialized into an object of type T</returns>
        public async static Task<T> DeserializeIfSuccessfullStatusCode<T>(HttpResponseMessage response, ILogger logger = null, string clientMethodName = "")
        {
            JsonSerializerOptions serializerOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            if (response.IsSuccessStatusCode)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(responseContent, serializerOptions);
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                HttpStatusException error = JsonSerializer.Deserialize<HttpStatusException>(responseContent, serializerOptions);
                if (error.StatusCode != response.StatusCode)
                {
                    error.StatusCode = response.StatusCode;
                }

                logger?.LogError($"AccessManagement.UI // {clientMethodName} // Unexpected HttpStatusCode: {response.StatusCode}\n {responseContent}");

                throw error;
            }
        }
    }
}
