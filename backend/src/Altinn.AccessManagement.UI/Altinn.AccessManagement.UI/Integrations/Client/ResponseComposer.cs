using System.Net;
using System.Text.Json;

namespace Altinn.AccessManagement.UI.Integrations.Client;

/// <summary>
/// Handles a HTTP response.
/// </summary>
public class ResponseComposer(ILogger logger, HttpResponseMessage message)
{
    private ILogger Logger { get; } = logger;

    private HttpResponseMessage Response { get; } = message;

    public ResponseComposer LogResponse()
    {
        Logger.LogInformation("Log response here");
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

    public void ThrowIfNotOk(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            throw new IntegrationException(response);
        }
    }
}