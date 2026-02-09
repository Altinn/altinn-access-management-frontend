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
        /// <param name="roles">Optional list of role identifiers to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of clients.</returns>
        [HttpGet]
        [Authorize]
        [Route("clients")]
        public async Task<ActionResult<IEnumerable<ClientDelegation>>> GetClients(
            [FromQuery] Guid party,
            [FromQuery] List<string> roles = null,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                List<ClientDelegation> clients = await _clientService.GetClients(party, roles, cancellationToken);
                return Ok(clients);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAgents failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving access packages delegated to an agent via a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="to">The uuid for the agent party.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of clients with delegated access packages.</returns>
        [HttpGet]
        [Authorize]
        [Route("agents/accesspackages")]
        public async Task<ActionResult<IEnumerable<ClientDelegation>>> GetAgentAccessPackages([FromQuery] Guid party, [FromQuery] Guid to, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                List<ClientDelegation> clients = await _clientService.GetAgentAccessPackages(party, to, cancellationToken);
                return Ok(clients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAgentAccessPackages failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving access packages delegated from a client via a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="from">The uuid for the client party.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of agents with delegated access packages.</returns>
        [HttpGet]
        [Authorize]
        [Route("clients/accesspackages")]
        public async Task<ActionResult<IEnumerable<AgentDelegation>>> GetClientAccessPackages([FromQuery] Guid party, [FromQuery] Guid from, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                List<AgentDelegation> agents = await _clientService.GetClientAccessPackages(party, from, cancellationToken);
                return Ok(agents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetClientAccessPackages failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for adding access packages for an agent via a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="from">The uuid for the client party.</param>
        /// <param name="to">The uuid for the agent party.</param>
        /// <param name="payload">Delegation payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>List of delegated access packages.</returns>
        [HttpPost]
        [Authorize]
        [Route("agents/accesspackages")]
        public async Task<ActionResult<IEnumerable<DelegationDto>>> AddAgentAccessPackages(
            [FromQuery] Guid party,
            [FromQuery] Guid from,
            [FromQuery] Guid to,
            [FromBody] DelegationBatchInputDto payload,
            CancellationToken cancellationToken = default)
        {
            if (payload == null)
            {
                return BadRequest("Delegation payload is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                List<DelegationDto> delegations = await _clientService.AddAgentAccessPackages(party, from, to, payload, cancellationToken);
                return Ok(delegations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddAgentAccessPackages failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for removing access packages for an agent via a party.
        /// </summary>
        /// <param name="party">The uuid for the party.</param>
        /// <param name="from">The uuid for the client party.</param>
        /// <param name="to">The uuid for the agent party.</param>
        /// <param name="payload">Delegation payload.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>No content on success.</returns>
        [HttpDelete]
        [Authorize]
        [Route("agents/accesspackages")]
        public async Task<IActionResult> RemoveAgentAccessPackages(
            [FromQuery] Guid party,
            [FromQuery] Guid from,
            [FromQuery] Guid to,
            [FromBody] DelegationBatchInputDto payload,
            CancellationToken cancellationToken = default)
        {
            if (payload == null)
            {
                return BadRequest("Delegation payload is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _clientService.RemoveAgentAccessPackages(party, from, to, payload, cancellationToken);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveAgentAccessPackages failed unexpectedly");
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
        /// <response code="400">Bad Request</response>
        /// <response code="429">TooManyRequests</response>
        /// <response code="500">Internal Server Error</response>
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

            // Clear model state errors for to if personInput is provided (they are mutually exclusive)
            if (personInput != null && ModelState.ContainsKey("to"))
            {
                ModelState.Remove("to");
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
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    return StatusCode(429);
                }

                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: ex.Message));
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveAgent failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }
    }
}
