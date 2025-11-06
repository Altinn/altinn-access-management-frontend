using System;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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
        /// Request payload for updating the selected language cookie.
        /// </summary>
        public class UpdateSelectedLanguageRequest
        {
            /// <summary>
            /// Gets or sets the language code to persist.
            /// </summary>
            public string LanguageCode { get; set; } = string.Empty;
        }

        /// <summary>
        /// Updates the Altinn persistent context cookie with the selected language.
        /// </summary>
        [HttpPost]
        [Authorize]
        [Route("language/selectedLanguage")]
        public IActionResult UpdateSelectedLanguage([FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] UpdateSelectedLanguageRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.LanguageCode))
            {
                return BadRequest("Language code is required.");
            }

            string altinnStandardLanguage = LanguageHelper.TryGetAltinn2StandardLanguage(request.LanguageCode);

            if (string.IsNullOrEmpty(altinnStandardLanguage))
            {
                return BadRequest("Unsupported language code.");
            }

            Response.Cookies.Append(
                "altinnPersistentContext",
                $"{altinnStandardLanguage}",
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddMonths(1),
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict,
                    Secure = true,
                    Path = "/"
                });

            return Ok();
        }

        /// <summary>
        /// Endpoint for retrieving notification addresses for an organization
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("org/{orgNumber}/notificationaddresses")]
        public async Task<ActionResult<List<NotificationAddressResponse>>> GetOrganisationNotificationAddresses([FromRoute] string orgNumber)
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
                _logger.LogError(ex, "GetOrganisationNotificationAddresses failed to fetch organisation notification addresses");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for posting a new address for an organization
        /// </summary>
        /// <param name="orgNumber">The organization number of the organization</param>
        /// <param name="notificationAddress">The notification address to be created</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("org/{orgNumber}/notificationaddresses")]
        public async Task<ActionResult<NotificationAddressResponse>> PostNewOrganisationNotificationAddress([FromRoute] string orgNumber, [FromBody] NotificationAddressModel notificationAddress)
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
                return await _settingsService.PostNewOrganisationNotificationAddress(orgNumber, notificationAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PostNewOrganisationNotificationAddress failed to post new address");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for deleting an address for an organization
        /// </summary>
        /// <param name="orgNumber">The organization number of the organization</param>
        /// <param name="notificationAddressId">The id of the notification address to be deleted</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("org/{orgNumber}/notificationaddresses/{notificationAddressId}")]
        public async Task<ActionResult<NotificationAddressResponse>> DeleteOrganisationNotificationAddress([FromRoute] string orgNumber, [FromRoute] int notificationAddressId)
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
                return await _settingsService.DeleteOrganisationNotificationAddress(orgNumber, notificationAddressId);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeleteOrganisationNotificationAddress failed to delete address");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for editing an already existing address for an organization
        /// </summary>
        /// <param name="orgNumber">The organization number of the organization</param>
        /// <param name="notificationAddressId">The id of the notification address to be changed</param>
        /// <param name="notificationAddress">The updated notification address</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPut]
        [Authorize]
        [Route("org/{orgNumber}/notificationaddresses/{notificationAddressId}")]
        public async Task<ActionResult<NotificationAddressResponse>> UpdateOrganisationNotificationAddress([FromRoute] string orgNumber, [FromRoute] int notificationAddressId, [FromBody] NotificationAddressModel notificationAddress)
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
                return await _settingsService.UpdateOrganisationNotificationAddress(orgNumber, notificationAddressId, notificationAddress);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateOrganisationNotificationAddress failed to delete address");
                return StatusCode(500);
            }
        }
    }
}
