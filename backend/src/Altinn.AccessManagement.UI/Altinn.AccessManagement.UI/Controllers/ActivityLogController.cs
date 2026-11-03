using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="ActivityLogController"/> provides API endpoints for the activity log. The log is
    /// split into areas (connections, request and maskinporten) that all expose the same routes.
    /// </summary>
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/activitylog")]
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ActivityLogController"/> class.
        /// </summary>
        /// <param name="activityLogService">Activity log service.</param>
        /// <param name="logger">Logger.</param>
        public ActivityLogController(
            IActivityLogService activityLogService,
            ILogger<ActivityLogController> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        /// <summary>
        /// Endpoint for getting a page of the area's log entries for a party, newest first.
        /// </summary>
        /// <param name="area">The area: connections, request or maskinporten.</param>
        /// <param name="query">Anchor (party and direction), filters and paging.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The page of entries and a link to the next page when more entries exist.</returns>
        [HttpGet]
        [Authorize]
        [Route("{area:regex(" + ActivityLogArea.RouteConstraint + ")}")]
        public async Task<ActionResult<PaginatedResult<ActivityLogDto>>> GetActivityLog(
            [FromRoute] string area,
            [FromQuery] ActivityLogQuery query,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                return Ok(await _activityLogService.GetActivityLog(area, query, cancellationToken));
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetActivityLog failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for getting the values occurring in the party's slice of the area for one filter
        /// field, so filter pickers only offer values that give hits.
        /// </summary>
        /// <param name="area">The area: connections, request or maskinporten.</param>
        /// <param name="field">The filter field, one of those the area offers (e.g. from, to, by, resource).</param>
        /// <param name="query">Anchor, filters, term and paging.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The page of values and a link to the next page when more values exist.</returns>
        [HttpGet]
        [Authorize]
        [Route("{area:regex(" + ActivityLogArea.RouteConstraint + ")}/filter/{field}")]
        public async Task<ActionResult<PaginatedResult<ActivityLogFilterValueDto>>> GetFilterValues(
            [FromRoute] string area,
            [FromRoute] string field,
            [FromQuery] ActivityLogFilterValuesQuery query,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                return Ok(await _activityLogService.GetFilterValues(area, field, query, cancellationToken));
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetFilterValues failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for getting the activity type catalog entries the area accepts, with name and
        /// description in the user's selected language.
        /// </summary>
        /// <param name="area">The area: connections, request or maskinporten.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The catalog entries.</returns>
        [HttpGet]
        [Authorize]
        [Route("{area:regex(" + ActivityLogArea.RouteConstraint + ")}/types")]
        public async Task<ActionResult<IEnumerable<ActivityTypeDto>>> GetActivityTypes(
            [FromRoute] string area,
            CancellationToken cancellationToken = default)
        {
            try
            {
                string languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(HttpContext);
                return Ok(await _activityLogService.GetActivityTypes(area, languageCode, cancellationToken));
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetActivityTypes failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }
    }
}
