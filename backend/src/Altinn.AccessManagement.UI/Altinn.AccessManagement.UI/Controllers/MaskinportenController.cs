using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="MaskinportenController"/> provides API endpoints related to Maskinporten administration.
    /// </summary>
    [AutoValidateAntiforgeryTokenIfAuthCookie]
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
        /// Endpoint for searching Maskinporten scope resources.
        /// </summary>
        /// <param name="parameters">Search parameters.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Paginated Maskinporten scope resources.</returns>
        [HttpGet]
        [Authorize]
        [Route("scopes/search")]
        public async Task<ActionResult<PaginatedList<ServiceResourceFE>>> SearchScopes([FromQuery] PaginatedSearchParams parameters, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(HttpContext);
                return Ok(await _maskinportenService.SearchScopes(languageCode, parameters, cancellationToken));
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SearchScopes failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for checking whether a Maskinporten scope resource can be delegated.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The resource delegation check.</returns>
        [HttpGet]
        [Authorize]
        [Route("resources/delegationcheck")]
        public async Task<ActionResult<ResourceCheckDto>> ResourceDelegationCheck(
            [Required][FromQuery] Guid party,
            [Required][FromQuery] string resource,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(resource))
            {
                return BadRequest(ModelState);
            }

            try
            {
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(HttpContext);
                return Ok(await _maskinportenService.ResourceDelegationCheck(party, resource, languageCode, cancellationToken));
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResourceDelegationCheck failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated Maskinporten scope resources.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="supplier">Optional supplier organization number.</param>
        /// <param name="resource">Optional resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of delegated resources.</returns>
        [HttpGet]
        [Authorize]
        [Route("resources")]
        public async Task<ActionResult<List<ResourceDelegation>>> GetResources(
            [Required][FromQuery] Guid party,
            [FromQuery] string supplier = null,
            [FromQuery] string resource = null,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(HttpContext);
                return Ok(await _maskinportenService.GetResources(languageCode, party, supplier, resource, cancellationToken));
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetResources failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for delegating a Maskinporten scope resource to a supplier.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Whether the resource was delegated.</returns>
        [HttpPost]
        [Authorize]
        [Route("resources")]
        public async Task<ActionResult<bool>> AddResource(
            [Required][FromQuery] Guid party,
            [Required][FromQuery] string supplier,
            [Required][FromQuery] string resource,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(supplier) || string.IsNullOrWhiteSpace(resource))
            {
                return BadRequest(ModelState);
            }

            try
            {
                return Ok(await _maskinportenService.AddResource(party, supplier, resource, cancellationToken));
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddResource failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for removing a delegated Maskinporten scope resource from a supplier.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>No content.</returns>
        [HttpDelete]
        [Authorize]
        [Route("resources")]
        public async Task<IActionResult> RemoveResource(
            [Required][FromQuery] Guid party,
            [Required][FromQuery] string supplier,
            [Required][FromQuery] string resource,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(supplier) || string.IsNullOrWhiteSpace(resource))
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _maskinportenService.RemoveResource(party, supplier, resource, cancellationToken);
                return NoContent();
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveResource failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving Maskinporten suppliers for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="supplier">Optional supplier org number to filter results to a single supplier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of suppliers.</returns>
        [HttpGet]
        [Authorize]
        [Route("suppliers")]
        public async Task<ActionResult<IEnumerable<MaskinportenConnection>>> GetSuppliers([FromQuery] Guid party, [FromQuery] string supplier = null, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                IEnumerable<MaskinportenConnection> suppliers = await _maskinportenService.GetSuppliers(party, supplier, cancellationToken);
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
        /// Endpoint for adding a Maskinporten supplier for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created supplier assignment.</returns>
        [HttpPost]
        [Authorize]
        [Route("suppliers")]
        public async Task<ActionResult<AssignmentDto>> AddSupplier([FromQuery] Guid party, [Required][FromQuery] string supplier, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                AssignmentDto assignment = await _maskinportenService.AddSupplier(party, supplier, cancellationToken);
                return Ok(assignment);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddSupplier failed unexpectedly");
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

        /// <summary>
        /// Endpoint for removing a Maskinporten supplier for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="cascade">Whether to also remove all delegated resources.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        [HttpDelete]
        [Authorize]
        [Route("suppliers")]
        public async Task<ActionResult> RemoveSupplier([FromQuery] Guid party, [Required][FromQuery] string supplier, [FromQuery] bool cascade = false, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _maskinportenService.RemoveSupplier(party, supplier, cascade, cancellationToken);
                return NoContent();
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveSupplier failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for removing a Maskinporten consumer connection (supplier relinquishes access).
        /// </summary>
        /// <param name="party">The uuid for the party (the supplier).</param>
        /// <param name="consumer">The consumer organization number.</param>
        /// <param name="cascade">Whether to also remove all delegated resources.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        [HttpDelete]
        [Authorize]
        [Route("consumers")]
        public async Task<ActionResult> RemoveConsumer([FromQuery] Guid party, [Required][FromQuery] string consumer, [FromQuery] bool cascade = false, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _maskinportenService.RemoveConsumer(party, consumer, cascade, cancellationToken);
                return NoContent();
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveConsumer failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }
    }
}
