using Altinn.AccessManagement.UI.Core.Models.Consent.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// API for Consent Integrations, both request and history
    /// </summary>
    [Route("accessmanagement/api/v1/consent")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class ConsentController : ControllerBase
    {
        private readonly IConsentService _consentService;

        /// <summary>
        /// Constructor for <see cref="ConsentController"/>
        /// </summary>
        public ConsentController(IConsentService consentService)
        {
            _consentService = consentService;
        }
        
        /// <summary>
        /// Get a consent request by id
        /// </summary>
        /// <param name="consentRequestId">Consent request to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{consentRequestId}")]
        public async Task<ActionResult> GetConsentRequest([FromRoute] Guid consentRequestId, CancellationToken cancellationToken)
        {
            Result<ConsentRequestFE> consentRequest = await _consentService.GetConsentRequest(consentRequestId, cancellationToken);

            if (consentRequest.IsProblem)
            {
                return consentRequest.Problem.ToActionResult();
            }

            return Ok(consentRequest.Value);
        }
    }
}