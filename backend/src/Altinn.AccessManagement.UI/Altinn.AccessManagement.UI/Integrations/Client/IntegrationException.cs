namespace Altinn.AccessManagement.UI.Integrations.Client;

/// <summary>
/// Integration exception.
/// </summary>
public class IntegrationException(HttpResponseMessage response): Exception
{
    /// <summary>
    /// HTTP response.
    /// </summary>
    public HttpResponseMessage Response { get; set; } = response;
}