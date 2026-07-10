using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Models.Dialogporten;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for dialogporten lookups.
    /// </summary>
    public class DialogportClient : IDialogportClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<DialogportClient> _logger;
        private readonly PlatformSettings _platformSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="DialogportClient"/> class.
        /// </summary>
        public DialogportClient(
            HttpClient httpClient,
            ILogger<DialogportClient> logger,
            IOptions<PlatformSettings> platformSettings)
        {
            _httpClient = httpClient;
            _logger = logger;
            _platformSettings = platformSettings.Value;

            if (!string.IsNullOrWhiteSpace(_platformSettings.ApiDialogportenEndpoint))
            {
                _httpClient.BaseAddress = new Uri(_platformSettings.ApiDialogportenEndpoint);
            }
        }

        /// <inheritdoc />
        public async Task<DialogLookup> GetDialogLookupByInstanceRef(string authorizationToken, string languageCode, string instanceRef)
        {
            if (string.IsNullOrWhiteSpace(_platformSettings.ApiDialogportenEndpoint))
            {
                return null;
            }

            string endpointUrl = $"enduser/dialoglookup?instanceRef={Uri.EscapeDataString(instanceRef)}";
            HttpResponseMessage response = await _httpClient.GetAsync(authorizationToken, endpointUrl, languageCode: languageCode);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<DialogLookup>(
                response,
                _logger,
                "DialogportClient // GetDialogLookupByInstanceRef");
        }
    }
}
