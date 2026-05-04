using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Exposes API endpoints for linking legacy Altinn 2 user accounts.
    /// </summary>
    [ApiController]
    [Authorize]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/selfidentifieduser")]
    public class SelfIdentifiedUserController : ControllerBase
    {
        private readonly ISelfIdentifiedUserService _selfIdentifiedUserService;

        /// <summary>
        /// Initializes a new instance of the <see cref="SelfIdentifiedUserController"/> class.
        /// </summary>
        public SelfIdentifiedUserController(
            ISelfIdentifiedUserService selfIdentifiedUserService)
        {
            _selfIdentifiedUserService = selfIdentifiedUserService;
        }

        /// <summary>
        /// Adds a legacy Altinn 2 self-identified user account to the current user's account.
        /// </summary>
        /// <param name="to">The user to a account to.</param>
        /// <param name="request">The legacy account username and password.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Result reflecting the platform response status.</returns>
        [HttpPost("altinn2user")]
        public async Task<ActionResult> AddAltinn2User([FromQuery] Guid to, [FromBody] Altinn2UserRequest request, CancellationToken cancellationToken)
        {
            Result<bool> result = await _selfIdentifiedUserService.AddAltinn2User(to, request, cancellationToken);
            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }

            return Ok(result.Value);
        }
    }
}
