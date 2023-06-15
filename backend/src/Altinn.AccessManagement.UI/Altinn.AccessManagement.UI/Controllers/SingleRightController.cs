using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Mvc;
namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller responsible for all operations regarding single rights
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/singleright")]
    public class SingleRightController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<MaskinportenSchemaController> _logger;

        [HttpPost("candelegate")]
        public async Task<ActionResult<CanDelegateResponse>> CanDelegateAccess([FromBody] string resourceId, [FromBody] string profileId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            CanDelegateResponse response = new CanDelegateResponse(resourceId, new List<RequestedAccessTypeResponses>());

            foreach (var accessType in Enum.GetValues(typeof(CanDelegateAccessType)))
            {
                bool canDelegate = await CheckDelegationCapability(request.ResourceId, accessType);
                
                response.Add(accessType, canDelegate);
            }

            return Ok(response);
        }
        
        
    }
}
