﻿using System.Diagnostics;
using System.Net;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with Access packages
    /// </summary>
    public class AccessPackageClient : IAccessPackageClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessPackageClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public AccessPackageClient(
            HttpClient httpClient,
            ILogger<AccessPackageClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenProvider accessTokenProvider)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _accessTokenProvider = accessTokenProvider;
        }

        /// <inheritdoc />
        public async Task<AccessPackage> GetAccessPackageById(string languageCode, Guid packageId)
        {
            string endpointUrl = $"meta/info/accesspackages/package/{packageId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);

            if (response.StatusCode == HttpStatusCode.NoContent)
            {
                return null;
            }
            else if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<AccessPackage>(responseContent, _serializerOptions);
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                HttpStatusException error = JsonSerializer.Deserialize<HttpStatusException>(responseContent, _serializerOptions);
                throw error;
            }
        }

        /// <inheritdoc />
        public async Task<IEnumerable<SearchObject<AccessPackage>>> GetAccessPackageSearchMatches(string languageCode, string searchString)
        {
            string endpointUrl = $"meta/info/accesspackages/search/?term={searchString}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);

            if (response.StatusCode == HttpStatusCode.NoContent)
            {
                return new List<SearchObject<AccessPackage>>();
            }
            else if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<IEnumerable<SearchObject<AccessPackage>>>(responseContent, _serializerOptions);
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                HttpStatusException error = JsonSerializer.Deserialize<HttpStatusException>(responseContent, _serializerOptions);

                throw error;
            }
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<PackagePermission>> GetAccessPackageAccesses(Guid party, Guid? to, Guid? from, string languageCode)
        {
            string endpointUrl = $"enduser/connections/accesspackages?party={party}&to={to}&from={from}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<PackagePermission>>(response);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateAccessPackageDelegation(Guid party, Guid to, Guid from, string packageId)
        {
            string endpointUrl = $"enduser/connections/accesspackages?party={party}&to={to}&from={from}&packageId={packageId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            var httpResponse = await _client.PostAsync(token, endpointUrl, null);

            return httpResponse;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, Guid party, string packageId)
        {
            string endpointUrl = $"enduser/connections/accesspackages?party={party}&to={to}&from={from}&packageId={packageId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);

            if (response.IsSuccessStatusCode)
            {
                return response;
            }

            _logger.LogError("Revoke resource delegation from accessmanagement failed with {StatusCode}", response.StatusCode);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }
    }
}
