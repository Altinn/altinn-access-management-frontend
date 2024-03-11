using System.Net.Http.Headers;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace Altinn.AccessManagement.UI.Integrations.Client;

/// <summary>
/// Builds a HTTP request.
/// </summary>
public partial class RequestComposer(IServiceProvider services, IHttpContextAccessor httpContextAccessor, IAccessTokenProvider accessTokenProvider, IOptions<Appsettings> appsettings)
{
    private IServiceProvider Provider { get; } = services;

    private IHttpContextAccessor HttpContextAccessor { get; } = httpContextAccessor;

    private IAccessTokenProvider AccessTokenProvider { get; } = accessTokenProvider;

    private IOptions<Appsettings> Appsettings { get; } = appsettings;

    /// <summary>
    /// Creates a new <see cref="RequestSender"/>.
    /// </summary>
    /// <param name="mutations">HTTP request mutations.</param>
    public RequestSender New(params Action<HttpRequestMessage>[] mutations)
    {
        var request = new HttpRequestMessage();
        foreach (var action in mutations)
        {
            action(request);
        }

        return Provider.GetRequiredService<RequestSender>()
            .SetRequest(request);
    }

    /// <summary>
    /// Serializes the given parameter body and writes it to the payload of the request.
    /// request.
    /// </summary>
    /// <param name="body">Object to serialize.</param>
    public Action<HttpRequestMessage> WithBodyJson<T>(T body)
        where T : class => message =>
    {
        var content = JsonSerializer.Serialize(body);
        message.Content = new StringContent(content, Encoding.UTF8, MediaTypeNames.Application.Json);
    };

    /// <summary>
    /// Adds the HTTP header Accept: application/json to the request.
    /// </summary>
    /// <param name="message">request.</param>
    public void WithHeaderAcceptJson(HttpRequestMessage message)
    {
        message.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue(MediaTypeNames.Application.Json));
    }

    /// <summary>
    /// The URL for the request. Joins the given segments with "/" to create the request's URL.
    /// </summary>
    /// <example>
    ///     <code>
    ///         Request.New(Request.WithRoute("https://altinn.no", "api", "v1", "persons", 1))
    ///     </code>
    ///     The request URL in the code snippet will be "https://altinn.no/api/v1/persons/1".
    /// </example>
    /// <param name="segments">path segments.</param>
    public Action<HttpRequestMessage> WithRoute(params object[] segments) => message =>
    {
        var url = string.Join("/", segments.Select(segment => segment.ToString().Trim('/')));
        message.RequestUri = new Uri(url);
    };

    /// <summary>
    /// Sets the HTTP verb of the request.
    /// </summary>
    /// <param name="httpMethod">request.</param>
    public Action<HttpRequestMessage> WithMethod(HttpMethod httpMethod) => message =>
    {
        message.Method = httpMethod;
    };

    /// <summary>
    /// Adds the bearer access token to the HTTP header "Authorizaton".
    /// </summary>
    /// <param name="message">request.</param>
    public void WithAccessToken(HttpRequestMessage message)
    {
        string token = JwtTokenUtil.GetTokenFromContext(HttpContextAccessor.HttpContext, Appsettings.Value.PlatformSettings.JwtCookieName);
        message.Headers.Add(HeaderNames.Authorization, $"Bearer {token}");
    }

    /// <summary>
    /// Adds the platform token to the HTTP header "PlatformAccessToken".
    /// </summary>
    /// <param name="message">request.</param>
    public void WithPlatformToken(HttpRequestMessage message)
    {
        var token = AccessTokenProvider.GetAccessToken().Result;
        message.Headers.Add("PlatformAccessToken", token);
    }
}