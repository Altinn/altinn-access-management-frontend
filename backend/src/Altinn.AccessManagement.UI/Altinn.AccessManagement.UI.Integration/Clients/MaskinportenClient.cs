using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with Maskinporten administration endpoints.
    /// </summary>
    public class MaskinportenClient : IMaskinportenClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenClient"/> class.
        /// </summary>
        /// <param name="httpClient">The http client.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="httpContextAccessor">The http context accessor.</param>
        /// <param name="platformSettings">Platform settings configuration.</param>
        public MaskinportenClient(
            HttpClient httpClient,
            ILogger<MaskinportenClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, string? supplier = null, CancellationToken cancellationToken = default)
        {
            var token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var endpointUrl = string.IsNullOrWhiteSpace(supplier)
                ? $"enduser/maskinportensuppliers?party={party}"
                : $"enduser/maskinportensuppliers?party={party}&supplier={Uri.EscapeDataString(supplier)}";
            try
            {
                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<MaskinportenConnection>>(response, _logger, "MaskinportenClient.GetSuppliers");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting suppliers");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", HttpStatusCode.InternalServerError, null, ex.Message);
            }
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddSupplier(Guid party, string supplier, CancellationToken cancellationToken = default)
        {
            var token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var endpointUrl = $"enduser/maskinportensuppliers?party={party}&supplier={supplier}";

            try
            {
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, null, cancellationToken);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("MaskinportenClient.AddSupplier failed with status code {StatusCode}. Response: {ResponseContent}", response.StatusCode, responseContent);
                    throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", response.StatusCode, null, responseContent);
                }

                return JsonSerializer.Deserialize<AssignmentDto>(responseContent, _serializerOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while adding Maskinporten supplier");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", HttpStatusCode.InternalServerError, null, ex.Message);
            }
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default)
        {
            var token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var endpointUrl = $"enduser/maskinportenconsumers?party={party}";
            try
            {
                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<MaskinportenConnection>>(response, _logger, "MaskinportenClient.GetConsumers");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting consumers");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", HttpStatusCode.InternalServerError, null, ex.Message);
            }
        }

        /// <inheritdoc />
        public async Task RemoveSupplier(Guid party, string supplier, bool cascade = false, CancellationToken cancellationToken = default)
        {
            var token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var endpointUrl = $"enduser/maskinportensuppliers?party={party}&supplier={supplier}&cascade={cascade}";
            try
            {
                HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
                if (!response.IsSuccessStatusCode)
                {
                    string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("MaskinportenClient.RemoveSupplier failed with status code {StatusCode}. Response: {ResponseContent}", response.StatusCode, responseContent);
                    throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", response.StatusCode, null, responseContent);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while removing Maskinporten supplier");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", HttpStatusCode.InternalServerError, null, ex.Message);
            }
        }

        /// <inheritdoc />
        public async Task RemoveConsumer(Guid party, string consumer, bool cascade = false, CancellationToken cancellationToken = default)
        {
            var token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var endpointUrl = $"enduser/maskinportenconsumers?party={party}&consumer={consumer}&cascade={cascade}";
            try
            {
                HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
                if (!response.IsSuccessStatusCode)
                {
                    string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("MaskinportenClient.RemoveConsumer failed with status code {StatusCode}. Response: {ResponseContent}", response.StatusCode, responseContent);
                    throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", response.StatusCode, null, responseContent);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while removing Maskinporten consumer");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", HttpStatusCode.InternalServerError, null, ex.Message);
            }
        }
    }
}
