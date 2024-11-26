using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Helpers;

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
        /// <returns>The response, deserialized into an object of type T</returns>
        public async static Task<T> DeserializeIfSuccessfullStatusCode<T>(HttpResponseMessage response)
        {
            JsonSerializerOptions serializerOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(responseContent, serializerOptions);
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                HttpStatusException error = JsonSerializer.Deserialize<HttpStatusException>(responseContent, serializerOptions);

                throw error;
            }
        }
    }
}
