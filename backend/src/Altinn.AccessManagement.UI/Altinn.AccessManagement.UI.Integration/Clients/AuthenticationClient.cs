using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Headers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using AltinnCore.Authentication.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients;

/// <summary>
/// A client for authentication actions in Altinn Platform.
/// </summary>
[ExcludeFromCodeCoverage]
public class AuthenticationClient : IAuthenticationClient
{
    private readonly ILogger _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly HttpClient _client;
    private readonly PlatformSettings _platformSettings;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthenticationClient"/> class
    /// </summary>
    /// <param name="platformSettings">The current platform settings.</param>
    /// <param name="logger">the logger</param>
    /// <param name="httpContextAccessor">The http context accessor </param>
    /// <param name="httpClient">A HttpClient provided by the HttpClientFactory.</param>
    public AuthenticationClient(
        IOptions<PlatformSettings> platformSettings,
        ILogger<AuthenticationClient> logger,
        IHttpContextAccessor httpContextAccessor,
        HttpClient httpClient)
    {
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _platformSettings = platformSettings.Value;
        httpClient.BaseAddress = new Uri(platformSettings.Value.ApiAuthenticationEndpoint);
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        _client = httpClient;
    }

    /// <inheritdoc />
    public async Task<string> RefreshToken()
    {
        return await RefreshTokenInternal();
    }

    /// <inheritdoc />
    public async Task<string> GetPidEnrichedToken()
    {
        return await RefreshTokenInternal(true);
    }

    private async Task<string> RefreshTokenInternal(bool enrichPid = false)
    {
        try
        {
            string endpointUrl = enrichPid ? "refresh?enrichPid=true" : "refresh";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            using HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, endpointUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            HttpResponseMessage response = await _client.SendAsync(request);

            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                string refreshedToken = await response.Content.ReadAsStringAsync();
                refreshedToken = refreshedToken.Replace('"', ' ').Trim();
                return refreshedToken;
            }
            else
            {
                _logger.LogError("Refreshing JwtToken failed with status code {statusCode}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AccessManagementUI // AuthenticationClient // RefreshTokenInternal // Exception");
            throw;
        }

        return null;
    }
}
