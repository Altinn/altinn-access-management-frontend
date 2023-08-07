using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
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
    [Route("accessmanagement/api/v1/singleright")]
    public class SingleRightController : Controller
    {
        private readonly ISingleRightService _singleRightService;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SingleRightController" /> class
        /// </summary>
        public SingleRightController(ISingleRightService singleRightService)
        {
            _singleRightService = singleRightService;
        }
        private Ok(responses);

        /// <summary>
        ///     Endpoint for checking delegation accesses on behalf of the party having offered the delegation
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost("checkdelegationaccesses/{partyId}")]
        [Authorize]
        public async Task<ActionResult<List<DelegationAccessCheckResponse>>> CheckDelegationAccess([FromRoute] string partyId, [FromBody] DelegationRequestDto request)
        {
            List<DelegationAccessCheckResponse> responses = new List<DelegationAccessCheckResponse>();

            try
            {
                return await _singleRightService.CheckDelegationAccess(partyId, request);
            }
            catch (Exception ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }
    }
}
