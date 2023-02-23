using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.AccessControl;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller responsible for all operations for managing delegations
    /// </summary>
    [ApiController]
    public class DelegationsController : ControllerBase
    {
        private readonly ILogger<DelegationsController> _logger;
        private readonly IDelegationsService _delegation;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationsController"/> class.
        /// </summary>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="delegationsService">the handler for delegations service</param>
        public DelegationsController(
            ILogger<DelegationsController> logger,
            IDelegationsService delegationsService)
        {
            _logger = logger;
            _delegation = delegationsService;
        }

        /// <summary>
        /// Endpoint for retrieving delegated resources between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/delegations/maskinportenschema/inbound")]
        public async Task<ActionResult<List<DelegationsFE>>> GetAllInboundDelegations([FromRoute] string party)
        {
            if (string.IsNullOrEmpty(party))
            {
                return BadRequest("Missing reportee party");
            }

            try
            {
                List<DelegationsFE> delegations = await _delegation.GetAllInboundDelegationsAsync(party);                
                //List<DelegationExternal> delegationsExternal = _mapper.Map<List<DelegationExternal>>(delegations);

                return delegations;
            }
            catch (ArgumentException)
            {
                return BadRequest("Either the reportee is not found or the supplied value for who is not in a valid format");
            }
            catch (Exception ex)
            {
                string errorMessage = ex.Message;
                _logger.LogError("Failed to fetch outbound delegations, See the error message for more details {errorMessage}", errorMessage);
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated resources between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/delegations/maskinportenschema/outbound")]
        public async Task<ActionResult<List<DelegationsFE>>> GetAllOutboundDelegations([FromRoute] string party)
        {
            if (string.IsNullOrEmpty(party))
            {
                return BadRequest("Missing reportee party");
            }

            try
            {
                List<DelegationsFE> delegations = await _delegation.GetAllOutboundDelegationsAsync(party);                
                //List<DelegationExternal> delegationsExternal = _mapper.Map<List<DelegationExternal>>(delegations);

                return delegations;
            }
            catch (ArgumentException)
            {
                return BadRequest("Either the reportee is not found or the supplied value for who is not in a valid format");
            }
            catch (Exception ex)
            {
                string errorMessage = ex.Message;
                _logger.LogError("Failed to fetch outbound delegations, See the error message for more details {errorMessage}", errorMessage);
                return StatusCode(500);
            }
        }
    }
}
