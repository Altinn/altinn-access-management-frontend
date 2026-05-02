using Altinn.AccessManagement.UI.Core.Helpers;
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
    [Route("accessmanagement/api/v1/altinn2user")]
    public class Altinn2UserController : ControllerBase
    {
        private readonly IAltinn2UserService _altinn2UserService;
        private readonly ILogger<Altinn2UserController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="Altinn2UserController"/> class.
        /// </summary>
        public Altinn2UserController(
            IAltinn2UserService Altinn2UserService,
            ILogger<Altinn2UserController> logger)
        {
            _altinn2UserService = Altinn2UserService;
            _logger = logger;
        }

        /// <summary>
        /// Adds a legacy Altinn 2 self-identified user account to the current user's account.
        /// </summary>
        /// <param name="request">The legacy account username and password.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Result reflecting the platform response status.</returns>
        [HttpPost("")]
        public async Task<ActionResult> AddAltinn2User([FromBody] Altinn2UserRequest request, CancellationToken cancellationToken)
        {
            Result<bool> result = await _altinn2UserService.AddAltinn2User(request, cancellationToken);
            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }

            return Ok(result.Value);
        }
    }
}
