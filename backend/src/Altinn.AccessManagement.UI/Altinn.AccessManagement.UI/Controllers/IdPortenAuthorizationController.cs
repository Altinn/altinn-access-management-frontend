using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller responsible for ID porten authorizations
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/idportenauthorization")]
    public class IdPortenAuthorizationController : ControllerBase
    {
        private readonly ILogger<IdPortenAuthorizationController> _logger;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly IIdPortenAuthorizationService _idPortenAuthorizationService;

        /// <summary>
        ///     Initializes a new instance of the <see cref="IdPortenAuthorizationController" /> class
        /// </summary>
        public IdPortenAuthorizationController(
            IIdPortenAuthorizationService idPortenAuthorizationService,
            ILogger<IdPortenAuthorizationController> logger)
        {
            _idPortenAuthorizationService = idPortenAuthorizationService;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            _logger = logger;
        }

        /// <summary>
        ///     Endpoint for getting ID-porten authorizations for logged in user
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        [HttpGet]
        [Authorize]
        [Route("")]
        public async Task<ActionResult> GetIdPortenAuthorizations(CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _idPortenAuthorizationService.GetIdPortenAuthorizations(cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during GetIdPortenAuthorizations: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for withdrawing an ID-porten authorization
        /// </summary>
        /// <param name="id">Id of authorization to withdraw</param>
        /// <param name="cancellationToken">Cancellation token</param>
        [HttpDelete]
        [Authorize]
        [Route("{id}")]
        public async Task<ActionResult> WithdrawIdPortenAuthorization([FromRoute] string id, CancellationToken cancellationToken)
        {
            try
            {
                var returnVal = await _idPortenAuthorizationService.WithdrawIdPortenAuthorization(id, cancellationToken);
                return Ok(returnVal);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during WithdrawIdPortenAuthorization: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }
    }
}
