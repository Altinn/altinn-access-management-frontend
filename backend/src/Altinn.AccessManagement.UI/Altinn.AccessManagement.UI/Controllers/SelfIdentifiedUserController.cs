using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Exposes API endpoints for linking self identified user accounts
    /// </summary>
    [ApiController]
    [Authorize]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/selfidentifieduser")]
    public class SelfIdentifiedUserController : ControllerBase
    {
        private readonly ISelfIdentifiedUserService _selfIdentifiedUserService;
        private readonly ILogger<SelfIdentifiedUserController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="SelfIdentifiedUserController"/> class.
        /// </summary>
        public SelfIdentifiedUserController(
            ISelfIdentifiedUserService selfIdentifiedUserService,
            ILogger<SelfIdentifiedUserController> logger)
        {
            _selfIdentifiedUserService = selfIdentifiedUserService;
            _logger = logger;
        }

        /// <summary>
        /// Adds a legacy Altinn 2 self-identified user account to the current user's account.
        /// </summary>
        /// <param name="to">The party UUID to connect to.</param>
        /// <param name="request">The legacy account username and password.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        [HttpPost("altinn2account")]
        public async Task<ActionResult> AddAltinn2Account([FromQuery] Guid to, [FromBody] Altinn2AccountRequest request, CancellationToken cancellationToken)
        {
            Guid altinn2AccountPartyUuid;
            try
            {
                altinn2AccountPartyUuid = await _selfIdentifiedUserService.ValidateCredentials(request, cancellationToken);
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Failed to validate credentials", detail: ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ValidateCredentials failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return await PostSelfIdentifiedUserConnection(to, altinn2AccountPartyUuid, cancellationToken);
        }

        /// <summary>
        /// Send forgot password email for a legacy Altinn 2 self-identified user account.
        /// </summary>
        /// <param name="request">The legacy account username</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        [HttpPost("altinn2account/forgotpassword")]
        public async Task<ActionResult> SendForgotPasswordEmail([FromBody] Altinn2ForgotPasswordRequest request, CancellationToken cancellationToken)
        {
            try
            {
                string emailAddress = await _selfIdentifiedUserService.SendForgotPasswordEmail(request, cancellationToken);
                return Ok(new { EmailAddress = emailAddress });
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Failed to send forgot password email", detail: ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SendForgotPasswordEmail failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Adds a legacy Altinn 2 self-identified user account from token to the current user's account.
        /// </summary>
        /// <param name="to">The party UUID to connect to.</param>
        /// <param name="request">The token from email.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        [HttpPost("altinn2account/token")]
        public async Task<ActionResult> AddAltinn2AccountFromToken([FromQuery] Guid to, [FromBody] Altinn2AccountFromTokenRequest request, CancellationToken cancellationToken)
        {
            Guid altinn2AccountPartyUuid;
            try
            {
                altinn2AccountPartyUuid = await _selfIdentifiedUserService.AddAltinn2AccountFromToken(request, cancellationToken);
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Failed to validate token", detail: ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddAltinn2AccountFromToken failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return await PostSelfIdentifiedUserConnection(to, altinn2AccountPartyUuid, cancellationToken);
        }

        private async Task<ActionResult> PostSelfIdentifiedUserConnection(Guid from, Guid to, CancellationToken cancellationToken)
        {
            try
            {
                await _selfIdentifiedUserService.PostNewSelfIdentifiedUser(from: from, to: to, cancellationToken);
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Failed to create self-identified user connection", detail: ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PostNewSelfIdentifiedUser failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok();
        }
    }
}
