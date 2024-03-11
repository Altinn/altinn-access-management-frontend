using System.Net;
using System.Text.Json;

namespace Altinn.AccessManagement.UI.Integrations.Client;

/// <summary>
/// Handles a HTTP response.
/// </summary>
public partial class ResponseComposer(ILogger<ResponseComposer> logger)
{
    private ILogger Logger { get; } = logger;

    private HttpResponseMessage Response { get; set; } = new();

    public ResponseComposer LogResponse()
    {
        Log.Response(Logger, Response.RequestMessage.Method, Response.RequestMessage.RequestUri, Response.StatusCode, Response.Content);
        return this;
    }

    public ResponseComposer SetResponse(HttpResponseMessage response)
    {
        Response = response;
        return this;
    }

    public ResponseComposer Assert(params Action<HttpResponseMessage>[] actions)
    {
        foreach (var action in actions)
        {
            action(Response);
        }

        return this;
    }

    public async Task<T> DeserializeAsync<T>()
    {
        return JsonSerializer.Deserialize<T>(await Response.Content.ReadAsStringAsync());
    }

    public Action<HttpResponseMessage> ThrowIfGotStatusCodes(params HttpStatusCode[] statusCodes) => response =>
    {
        if (statusCodes.Contains(response.StatusCode))
        {
            throw new IntegrationException(response);
        }
    };

    public void ThrowIfNotSuccessful(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            throw new IntegrationException(response);
        }
    }

    private static partial class Log
    {
        [LoggerMessage(1, LogLevel.Information, "Received HTTP response {verb}: {route} {statuscode}\n\n\n{body}")]
        public static partial void Response(ILogger logger, HttpMethod verb, Uri route, HttpStatusCode statuscode, HttpContent body);
    }
}