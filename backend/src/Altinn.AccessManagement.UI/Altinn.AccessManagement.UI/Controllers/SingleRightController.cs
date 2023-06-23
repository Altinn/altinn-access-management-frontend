using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.SingleRightDelegationInputDto;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller responsible for all operations regarding single rights
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/singleright")]
    public class SingleRightController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<MaskinportenSchemaController> _logger;
        private readonly ISingleRightService _singleRightService;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SingleRightController" /> class
        /// </summary>
        public SingleRightController(IHttpContextAccessor httpContextAccessor, ILogger<MaskinportenSchemaController> logger, ISingleRightService singleRightService)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _singleRightService = singleRightService;
        }

        /// <summary>
        ///     Endpoint for checking delegation accesses on behalf of the party having offered the delegation
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost("checkdelegationaccesses/{partyId}")]
        public async Task<ActionResult<List<DelegationAccessCheckResponse>>> CheckDelegationAccess([FromRoute] string partyId, [FromBody] CheckDelegationAccessDto request)
        {
            List<DelegationAccessCheckResponse> response = await _singleRightService.CheckDelegationAccess(partyId, request);

            return Ok(response);
        }
    }
}
