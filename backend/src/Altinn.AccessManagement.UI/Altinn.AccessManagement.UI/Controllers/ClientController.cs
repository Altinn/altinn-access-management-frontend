using System.Collections.Generic;
using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="ClientController"/> provides API endpoints related to client delegations.
    /// </summary>
    [Route("accessmanagement/api/v1/clientdelegations")]
    public class ClientController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientController"/> class.
        /// </summary>
        public ClientController(
            IClientService clientService,
            ILogger<ClientController> logger)
        {
            _clientService = clientService;
            _logger = logger;
        }

        /// <summary>
        /// Endpoint for retrieving clients for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of clients.</returns>
        [HttpGet]
        [Authorize]
        [Route("clients")]
        public async Task<ActionResult<IEnumerable<ClientDelegation>>> GetClients([FromQuery] Guid party, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                List<ClientDelegation> clients = await _clientService.GetClients(party, cancellationToken);
                return Ok(clients);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetClients failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving agents for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of agents.</returns>
        [HttpGet]
        [Authorize]
        [Route("agents")]
        public async Task<ActionResult<IEnumerable<AgentDelegation>>> GetAgents([FromQuery] Guid party, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                List<AgentDelegation> agents = await _clientService.GetAgents(party, cancellationToken);
                return Ok(agents);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAgents failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for adding a new agent for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="to">The uuid for the agent party.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Assignment details for the agent.</returns>
        [HttpPost]
        [Authorize]
        [Route("agents")]
        public async Task<ActionResult<AssignmentDto>> AddAgent([FromQuery] Guid party, [FromQuery] Guid? to, CancellationToken cancellationToken = default)
        {
            PersonInput personInput = null;

            if (!to.HasValue || to == Guid.Empty)
            {
                try
                {
                    personInput = await HttpContext.Request.ReadFromJsonAsync<PersonInput>();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to read PersonInput in AddAgent for party {Party}", party);
                    return BadRequest("Failed to read PersonInput.");
                }
            }

            if ((to == null || to == Guid.Empty) && personInput == null)
            {
                return BadRequest("Either to or personInput must be provided.");
            }

            if (personInput != null && !TryValidateModel(personInput))
            {
                return BadRequest(ModelState);
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                AssignmentDto assignment = await _clientService.AddAgent(party, to, personInput, cancellationToken);
                return Ok(assignment);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddAgent failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for removing an agent for a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="to">The uuid for the agent party.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        [HttpDelete]
        [Authorize]
        [Route("agents")]
        public async Task<IActionResult> RemoveAgent([FromQuery] Guid party, [FromQuery] Guid to, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _clientService.RemoveAgent(party, to, cancellationToken);
                return NoContent();
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveAgent failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated access packages to agents.
        /// </summary>
        [HttpGet]
        [Authorize]
        [Route("agents/accesspackages")]
        public async Task<IActionResult> GetDelegatedAccessPackagesToAgentsViaParty([FromQuery] Guid party, [FromQuery] Guid to, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                HttpResponseMessage response = await _clientService.GetDelegatedAccessPackagesToAgentsViaParty(party, to, cancellationToken);
                return await HandleProxyResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetDelegatedAccessPackagesToAgentsViaParty failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated access packages from clients.
        /// </summary>
        [HttpGet]
        [Authorize]
        [Route("clients/accesspackages")]
        public async Task<IActionResult> GetDelegatedAccessPackagesFromClientsViaParty([FromQuery] Guid party, [FromQuery] Guid from, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                HttpResponseMessage response = await _clientService.GetDelegatedAccessPackagesFromClientsViaParty(party, from, cancellationToken);
                return await HandleProxyResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetDelegatedAccessPackagesFromClientsViaParty failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for delegating an access package to an agent.
        /// </summary>
        [HttpPost]
        [Authorize]
        [Route("agents/accesspackages")]
        public async Task<IActionResult> AddAgentAccessPackage([FromQuery] Guid party, [FromQuery] Guid from, [FromQuery] Guid to, [FromQuery] Guid? packageId, [FromQuery] string package, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                HttpResponseMessage response = await _clientService.AddAgentAccessPackage(party, from, to, packageId, package, cancellationToken);
                return await HandleProxyResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddAgentAccessPackage failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for removing an access package from an agent.
        /// </summary>
        [HttpDelete]
        [Authorize]
        [Route("agents/accesspackages")]
        public async Task<IActionResult> DeleteAgentAccessPackage([FromQuery] Guid party, [FromQuery] Guid from, [FromQuery] Guid to, [FromQuery] Guid? packageId, [FromQuery] string package, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                HttpResponseMessage response = await _clientService.DeleteAgentAccessPackage(party, from, to, packageId, package, cancellationToken);
                return await HandleProxyResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeleteAgentAccessPackage failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        private async Task<IActionResult> HandleProxyResponse(HttpResponseMessage response)
        {
            if (response.IsSuccessStatusCode)
            {
                if (response.StatusCode == HttpStatusCode.NoContent)
                {
                    return NoContent();
                }

                string responseContent = await response.Content.ReadAsStringAsync();
                return new ContentResult
                {
                    Content = responseContent,
                    ContentType = "application/json",
                    StatusCode = (int)response.StatusCode,
                };
            }

            string errorContent = await response.Content.ReadAsStringAsync();
            return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Unexpected HttpStatus response", detail: errorContent));
        }
    }
}
