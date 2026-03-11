using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller responsible for all operations regarding single rights
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/request")]
    public class RequestController : Controller
    {
        private readonly ILogger<RequestController> _logger;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly IRequestService _requestService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        ///     Initializes a new instance of the <see cref="RequestController" /> class
        /// </summary>
        public RequestController(
            IRequestService requestService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<RequestController> logger)
        {
            _requestService = requestService;
            _httpContextAccessor = httpContextAccessor;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            _logger = logger;
        }

        /// <summary>
        ///     Endpoint for getting single right requests sent from one party to another
        /// </summary>
        /// <param name="party">The acting party that is asking to get the single right requests</param>
        /// <param name="from">The party asking for the single right requests</param>
        /// <param name="to">The party the requests is for</param>
        /// <param name="status">Status filter</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("")]
        public async Task<ActionResult> GetSingleRightRequests([FromQuery] Guid party, [FromQuery] Guid from, [FromQuery] Guid to, [FromQuery] List<RequestStatus> status, CancellationToken cancellationToken)
        {
            var returnVal = await _requestService.GetSingleRightRequests(party, from, to, status, cancellationToken);

            return Ok(returnVal);
        }

        /// <summary>
        ///     Endpoint for requesting a single right from a party
        /// </summary>
        /// <param name="party">The acting party that is asking to get the single right requests</param>
        /// <param name="from">The party asking for the single right requests</param>
        /// <param name="to">The party the requests is for</param>
        /// <param name="resource">The resource to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("")]
        public async Task<ActionResult> CreateSingleRightRequest([FromQuery] Guid party, [FromQuery] Guid from, [FromQuery] Guid to, [FromQuery] string resource, CancellationToken cancellationToken)
        {
            var returnVal = await _requestService.CreateSingleRightRequest(party, from, to, resource, cancellationToken);

            return Ok(returnVal);
        }

        /// <summary>
        ///     Endpoint for withdrawing a single right request
        /// </summary>
        /// <param name="id">The request id to withdraw</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("")]
        public async Task<ActionResult> WithdrawSingleRightRequest([FromQuery] Guid id, CancellationToken cancellationToken)
        {
            var returnVal = await _requestService.WithdrawSingleRightRequest(id, cancellationToken);

            return Ok(returnVal);
        }
    }
}