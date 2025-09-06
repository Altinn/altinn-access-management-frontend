using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with consent endpoints
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class ConsentClient : IConsentClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="ConsentClient"/> class.
        /// </summary>
        /// <param name="logger">The logger instance.</param>
        /// <param name="httpClient">The HTTP client instance.</param>
        /// <param name="httpContextAccessor">The HTTP context accessor instance.</param>
        /// <param name="platformSettings">The platform settings.</param>
        public ConsentClient(
            ILogger<ConsentClient> logger,
            HttpClient httpClient,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _httpClient = httpClient;
        }

        /// <inheritdoc/>
        public async Task<Result<ConsentRequestDetails>> GetConsentRequest(Guid consentRequestId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"bff/consentrequests/{consentRequestId}";

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<ConsentRequestDetails>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // ConsentClient // GetConsentRequest // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);

                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ConsentProblemMapper.MapToConsentUiError(problemDetails, response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ConsentClient // GetConsentRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> RejectConsentRequest(Guid consentRequestId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"bff/consentrequests/{consentRequestId}/reject";

                HttpResponseMessage response = await _httpClient.PostAsync(token, endpointUrl, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // ConsentClient // RejectConsentRequest // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);

                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ConsentProblemMapper.MapToConsentUiError(problemDetails, response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ConsentClient // RejectConsentRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> ApproveConsentRequest(Guid consentRequestId, ApproveConsentContext context, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"bff/consentrequests/{consentRequestId}/accept";
                var content = JsonContent.Create(context);

                HttpResponseMessage response = await _httpClient.PostAsync(token, endpointUrl, content);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // ConsentClient // ApproveConsentRequest // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);

                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ConsentProblemMapper.MapToConsentUiError(problemDetails, response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ConsentClient // ApproveConsentRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<List<ConsentTemplate>> GetConsentTemplates(CancellationToken cancellationToken)
        {
            // Get consent templates from altinn-studio-docs. Will be moved to resource registry later.
            string endpointUrl = "https://raw.githubusercontent.com/Altinn/altinn-studio-docs/master/content/authorization/architecture/resourceregistry/consent_templates.json";

            HttpResponseMessage response = await _httpClient.GetAsync(endpointUrl, cancellationToken);
            if (response.StatusCode == HttpStatusCode.OK)
            {
                string content = await response.Content.ReadAsStringAsync(cancellationToken);
                return JsonSerializer.Deserialize<List<ConsentTemplate>>(content, _jsonSerializerOptions);
            }

            return null;
        }

        /// <inheritdoc/>
        public async Task<Result<List<Consent>>> GetConsentList(Guid partyId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"bff/activeconsents/{partyId}";

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<List<Consent>>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // ConsentClient // GetConsentList // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);

                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ConsentProblemMapper.MapToConsentUiError(problemDetails, response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ConsentClient // GetConsentList // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<Consent>> GetConsent(Guid consentId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"bff/consents/{consentId}";

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<Consent>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // ConsentClient // GetConsent // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);

                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ConsentProblemMapper.MapToConsentUiError(problemDetails, response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ConsentClient // GetConsent // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> RevokeConsent(Guid consentId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"bff/consents/{consentId}/revoke";

                HttpResponseMessage response = await _httpClient.PostAsync(token, endpointUrl, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // ConsentClient // RevokeConsent // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);

                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ConsentProblemMapper.MapToConsentUiError(problemDetails, response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ConsentClient // RevokeConsent // Exception");
                throw;
            }
        }
    }
}