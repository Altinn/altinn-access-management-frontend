using System.Net;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="ConnectionController"/> provides the API endpoints related to persons.
    /// </summary>
    [Route("accessmanagement/api/v1/connection")]
    public class ConnectionController : ControllerBase
    {
        private readonly IConnectionService _connectionService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly FeatureFlags _featureFlags;

        /// <summary>
        /// Initializes a new instance of the <see cref="ConnectionController"/> class
        /// </summary>
        public ConnectionController(
            IConnectionService connectionService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<ConnectionController> logger,
            IOptions<FeatureFlags> featureFlags)
        {
            _connectionService = connectionService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _featureFlags = featureFlags.Value;
        }

        /// <summary>
        /// Endpoint for retrieving all right holders of a reportee
        /// </summary>
        /// <param name="partyId">The partyId for the reportee who's right holders to return</param>
        /// <returns>List of right holders</returns>
        [HttpGet]
        [Authorize]
        [Route("reportee/{partyId}/rightholders")]
        public async Task<ActionResult<List<User>>> GetReporteeRightHolders(int partyId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                List<User> rightHolders = await _connectionService.GetReporteeConnections(partyId);

                return rightHolders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetReportee failed to fetch right holders");
                return StatusCode(500);
            }
        }

        /// <summary>
        ///     Endpoint for revoking all rights associated with a right holder by revoking their status as a right holder for another party.
        /// </summary>
        /// <param name="party">The uuid identifying the party the authenticated user is acting on behalf of.</param>
        /// <param name="from">The uuid identifying the party the authenticated user is acting for.</param>
        /// <param name="to">The uuid identifying the target party to which the assignment should be deleted.</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("reportee")]
        public async Task<ActionResult> RevokeRightHolder([FromQuery] Guid party, [FromQuery] Guid from, [FromQuery] Guid to)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _connectionService.RevokeRightHolderConnection(party, from, to);
                return NoContent();
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.NoContent)
                {
                    return NoContent();
                }

                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
        }

        /// <summary>
        /// Endpoint for validating a new rightholder through a person identifier (ssn or username) and last name combination.
        /// If the ssn and last name does not match, the endpoint will return 404. Usernames cannot be validated and will return 404.
        /// If the endpont is called with unmatching input too many times, the user calling the endpoint will be blocked for an hour and the request will return 429.
        /// If the combination is valid, the endpoint will return the partyUuid of the person.
        /// </summary>
        /// <param name="validationInput">The person identifier and last name of the person to be looked up</param>
        /// <returns>The partyUuid of the person</returns>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("reportee/{partyUuid}/rightholder/validateperson")]
        public async Task<ActionResult<Guid>> ValidatePerson([FromBody] ValidatePersonInput validationInput)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                Guid? partyUuid = await _connectionService.ValidatePerson(validationInput.PersonIdentifier, validationInput.LastName);

                if (partyUuid != null)
                {
                    return partyUuid;
                }
                else
                {
                    return StatusCode(404);
                }
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    return StatusCode(429);
                }
                else
                {
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: ex.Message));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ValidatePerson failed unexpectedly");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for adding a new party as a right holder to reportee party. Note that a body of type PersonInput is expected when no rightholderPartyUuid is provided.
        /// </summary>
        /// <param name="partyUuid">The uuid of the reportee party</param>
        /// <param name="rightholderPartyUuid">The uuid of the party that will become a rightHolder (only provided when rightholder is an org)</param>
        /// <returns>The uuid of the added party</returns>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        /// <response code="429">TooManyRequests</response>
        [HttpPost]
        [Authorize]
        [Route("reportee/{partyUuid}/rightholder")]
        public async Task<ActionResult<Guid>> AddReporteeRightHolder([FromRoute] Guid partyUuid, [FromQuery] Guid? rightholderPartyUuid)
        {
            PersonInput personInput = null;

            // Try to read personInput from body if rightholderPartyUuid is not provided
            if (!rightholderPartyUuid.HasValue || rightholderPartyUuid == Guid.Empty)
            {
                try
                {
                    personInput = await HttpContext.Request.ReadFromJsonAsync<PersonInput>();
                }
                catch
                {
                    // If we can't read the body or it's invalid, personInput remains null
                }
            }

            // Clear model state errors for rightholderPartyUuid if personInput is provided (they are mutually exclusive)
            if (personInput != null && ModelState.ContainsKey("rightholderPartyUuid"))
            {
                ModelState.Remove("rightholderPartyUuid");
            }

            if ((rightholderPartyUuid == null || rightholderPartyUuid == Guid.Empty) && personInput == null)
            {
                return BadRequest("Either rightholderPartyUuid or personInput must be provided.");
            }

            // Validate personInput specifically if it's provided
            if (personInput != null && !TryValidateModel(personInput))
            {
                return BadRequest(ModelState);
            }

            // Check for any remaining model state errors
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var rightHolderUuid = await _connectionService.AddReporteeRightHolderConnection(partyUuid, rightholderPartyUuid, personInput);
                return Ok(rightHolderUuid);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    return StatusCode(429);
                }
                else
                {
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: ex.Message));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddReporteeRightHolder failed unexpectedly");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Gets the assignments between the authenticated user's selected party and the specified target party (to, from or both).
        /// </summary>
        /// <param name="party">The string representation of the GUID identifying the party the authenticated user is acting on behalf of.</param>
        /// <param name="from">The string representation of the GUID identifying the party the authenticated user is acting for (optional).</param>
        /// <param name="to">The string representation of the GUID identifying the target party to which the assignment should be created (optional).</param>
        /// <remarks>
        /// Party must match From or To
        /// Either from or to must be provided
        /// </remarks>
        /// <returns>Returns a list of assignments between the authenticated user's selected party and the specified target party.</returns>
        [HttpGet]
        [Authorize]
        [Route("rightholders")]
        public async Task<ActionResult> GetRightholders([FromQuery] Guid party, [FromQuery] Guid? from, [FromQuery] Guid? to)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!from.HasValue && !to.HasValue)
            {
                return BadRequest("Either 'from' or 'to' query parameter must be provided.");
            }

            try
            {
                string userPartyID = AuthenticationHelper.GetUserPartyId(_httpContextAccessor.HttpContext);

                var rightHolders = await _connectionService.GetConnections(party, from, to);

                return Ok(rightHolders);
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response"));
            }
        }
    }
}
