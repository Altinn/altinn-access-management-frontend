using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller responsible for all operations for lookup
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/settings/")]
    public class SettingsController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly ISettingsService _settingsService;

        /// <summary>
        /// Initializes a new instance of the <see cref="SettingsController"/> class.
        /// </summary>
        /// <param name="logger">the logger.</param>
        /// <param name="settingsService">service implementation for settings</param>
        public SettingsController(
            ILogger<SettingsController> logger,
            ISettingsService settingsService)
        {
            _logger = logger;
            _settingsService = settingsService;
        }

        /// <summary>
        /// Endpoint for retrieving notification addresses for an organization
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("org/{orgNumber}/notificationaddresses")]
        public async Task<ActionResult<List<NotificationAddressResponse>>> GetOrganisationNotificationAddresses(string orgNumber)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrEmpty(orgNumber) || orgNumber.Length != 9 || !int.TryParse(orgNumber, out _))
            {
                return StatusCode(400, "Org number must be a number with 9 digits");
            }

            try
            {
                List<NotificationAddressResponse> addresses = await _settingsService.GetOrganisationNotificationAddresses(orgNumber);

                if (addresses == null)
                {
                    return NoContent();
                }
                else
                {
                    return addresses;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetOrganisation failed to fetch organisation information");
                return StatusCode(500);
            }
        }
    }
}
