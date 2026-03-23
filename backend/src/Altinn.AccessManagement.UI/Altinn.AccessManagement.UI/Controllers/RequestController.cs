using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller responsible for all operations regarding requests
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/request")]
    public class RequestController : ControllerBase
    {
        private readonly ILogger<RequestController> _logger;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly IRequestService _requestService;

        /// <summary>
        ///     Initializes a new instance of the <see cref="RequestController" /> class
        /// </summary>
        public RequestController(
            IRequestService requestService,
            ILogger<RequestController> logger)
        {
            _requestService = requestService;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            _logger = logger;
        }

        /// <summary>
        ///     Endpoint for getting requests sent by a party
        /// </summary>
        /// <param name="party">The acting party</param>
        /// <param name="to">The party the requests were sent to</param>
        /// <param name="status">Status filter</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("sent")]
        public async Task<ActionResult> GetSentRequests([FromQuery] Guid party, [FromQuery] Guid? to, [FromQuery] List<RequestStatus> status, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _requestService.GetSentRequests(party, to, status, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during GetSentRequests: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for getting enriched resource requests sent by a party
        /// </summary>
        /// <param name="party">The acting party</param>
        /// <param name="to">The party the requests were sent to</param>
        /// <param name="status">Status filter</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("sent/resource")]
        public async Task<ActionResult> GetEnrichedSentResourceRequests([FromQuery] Guid party, [FromQuery] Guid? to, [FromQuery] List<RequestStatus> status, CancellationToken cancellationToken)
        {
            try
            {
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(HttpContext);
                var returnVal = await _requestService.GetEnrichedSentResourceRequests(party, to, status, languageCode, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during GetEnrichedSentResourceRequests: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for getting requests received by a party
        /// </summary>
        /// <param name="party">The acting party</param>
        /// <param name="from">The party who sent the requests</param>
        /// <param name="status">Status filter</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("received")]
        public async Task<ActionResult> GetReceivedRequests([FromQuery] Guid party, [FromQuery] Guid? from, [FromQuery] List<RequestStatus> status, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _requestService.GetReceivedRequests(party, from, status, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during GetReceivedRequests: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for getting enriched requests received by a party
        /// </summary>
        /// <param name="party">The acting party</param>
        /// <param name="from">The party who sent the requests</param>
        /// <param name="status">Status filter</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("received/resource")]
        public async Task<ActionResult> GetEnrichedReceivedResourceRequests([FromQuery] Guid party, [FromQuery] Guid? from, [FromQuery] List<RequestStatus> status, CancellationToken cancellationToken)
        {
            try
            {
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(HttpContext);
                var returnVal = await _requestService.GetEnrichedReceivedResourceRequests(party, from, status, languageCode, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during GetEnrichedReceivedResourceRequests: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for getting a single request by id
        /// </summary>
        /// <param name="party">The acting party</param>
        /// <param name="id">The request id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("{id}")]
        public async Task<ActionResult> GetRequest([FromQuery] Guid party, [FromRoute] Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _requestService.GetRequest(party, id, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during GetRequest: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for creating a resource request
        /// </summary>
        /// <param name="party">The acting party creating the request</param>
        /// <param name="to">The party the request is directed to</param>
        /// <param name="resource">The resource to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("resource")]
        public async Task<ActionResult> CreateResourceRequest([FromQuery] Guid party, [FromQuery] Guid to, [FromQuery] string resource, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _requestService.CreateResourceRequest(party, to, resource, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during CreateResourceRequest: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for withdrawing a request
        /// </summary>
        /// <param name="party">The acting party withdrawing the request</param>
        /// <param name="id">The request id to withdraw</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("sent/withdraw")]
        public async Task<ActionResult> WithdrawRequest([FromQuery] Guid party, [FromQuery] Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _requestService.WithdrawRequest(party, id, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during WithdrawRequest: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for confirming a draft request (transitions Draft → Pending)
        /// </summary>
        /// <param name="party">The acting party confirming the request</param>
        /// <param name="id">The request id to confirm</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPut]
        [Authorize]
        [Route("sent/confirm")]
        public async Task<ActionResult> ConfirmRequest([FromQuery] Guid party, [FromQuery] Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _requestService.ConfirmRequest(party, id, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during ConfirmRequest: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for rejecting a pending request
        /// </summary>
        /// <param name="party">The acting party rejecting the request</param>
        /// <param name="id">The request id to reject</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPut]
        [Authorize]
        [Route("received/reject")]
        public async Task<ActionResult> RejectRequest([FromQuery] Guid party, [FromQuery] Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _requestService.RejectRequest(party, id, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during RejectRequest: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for approving a pending request
        /// </summary>
        /// <param name="party">The acting party approving the request</param>
        /// <param name="id">The request id to approve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPut]
        [Authorize]
        [Route("received/approve")]
        public async Task<ActionResult> ApproveRequest([FromQuery] Guid party, [FromQuery] Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _requestService.ApproveRequest(party, id, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during ApproveRequest: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }
    }
}