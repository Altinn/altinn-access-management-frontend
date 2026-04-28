using System.Collections.Generic;
using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="MaskinportenController"/> provides API endpoints related to Maskinporten administration.
    /// </summary>
    [Route("accessmanagement/api/v1/maskinporten")]
    public class MaskinportenController : ControllerBase
    {
        private readonly IMaskinportenService _maskinportenService;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenController"/> class.
        /// </summary>
        /// <param name="maskinportenService">Maskinporten service.</param>
        /// <param name="logger">Logger.</param>
        public MaskinportenController(
            IMaskinportenService maskinportenService,
            ILogger<MaskinportenController> logger)
        {
            _maskinportenService = maskinportenService;
            _logger = logger;
        }

        /// <summary>
        /// Endpoint for retrieving Maskinporten suppliers for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of suppliers.</returns>
        [HttpGet]
        [Authorize]
        [Route("suppliers")]
        public async Task<ActionResult<IEnumerable<MaskinportenConnection>>> GetSuppliers([FromQuery] Guid party, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                IEnumerable<MaskinportenConnection> suppliers = await _maskinportenService.GetSuppliers(party, cancellationToken);
                return Ok(suppliers);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetSuppliers failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving Maskinporten consumers for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of consumers.</returns>
        [HttpGet]
        [Authorize]
        [Route("consumers")]
        public async Task<ActionResult<IEnumerable<MaskinportenConnection>>> GetConsumers([FromQuery] Guid party, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                IEnumerable<MaskinportenConnection> consumers = await _maskinportenService.GetConsumers(party, cancellationToken);
                return Ok(consumers);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetConsumers failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }
    }
}
