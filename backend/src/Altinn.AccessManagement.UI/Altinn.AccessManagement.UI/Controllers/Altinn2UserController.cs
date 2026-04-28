using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
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
        /// <returns>Result reflecting the platform response status.</returns>
        [HttpPost("")]
        public async Task<IActionResult> AddAltinn2User([FromBody] Altinn2UserRequest request)
        {
            try
            {
                await _altinn2UserService.AddAltinn2User(request);
                return Ok();
            }
            catch (HttpStatusException statusEx)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: statusEx.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during AddAltinn2User: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }
    }
}
