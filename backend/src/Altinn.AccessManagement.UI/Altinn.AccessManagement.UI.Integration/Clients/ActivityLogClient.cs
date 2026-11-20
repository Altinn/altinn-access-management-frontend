using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for the activity log endpoints of the access management API (v2 enduser areas).
    /// Every area exposes the same routes under <c>enduser/{area}/activitylog</c>.
    /// </summary>
    public class ActivityLogClient : IActivityLogClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="ActivityLogClient"/> class.
        /// </summary>
        /// <param name="httpClient">The http client.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="httpContextAccessor">The http context accessor.</param>
        /// <param name="platformSettings">Platform settings configuration.</param>
        public ActivityLogClient(
            HttpClient httpClient,
            ILogger<ActivityLogClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint + "v2/");
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<ActivityLogDto>> GetActivityLog(string area, ActivityLogQuery query, CancellationToken cancellationToken = default)
        {
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            string endpointUrl = $"enduser/{area}/activitylog?{query.ToQueryString()}";

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<ActivityLogDto>>(response, _logger, "ActivityLogClient.GetActivityLog");
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<ActivityLogFilterValueDto>> GetFilterValues(string area, string field, ActivityLogFilterValuesQuery query, CancellationToken cancellationToken = default)
        {
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            string endpointUrl = $"enduser/{area}/activitylog/filter/{Uri.EscapeDataString(field)}?{query.ToQueryString()}";

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<ActivityLogFilterValueDto>>(response, _logger, "ActivityLogClient.GetFilterValues");
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ActivityTypeDto>> GetActivityTypes(string area, string languageCode, CancellationToken cancellationToken = default)
        {
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            string endpointUrl = $"enduser/{area}/activitylog/types";

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken, languageCode: languageCode);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<ActivityTypeDto>>(response, _logger, "ActivityLogClient.GetActivityTypes");
        }
    }
}
