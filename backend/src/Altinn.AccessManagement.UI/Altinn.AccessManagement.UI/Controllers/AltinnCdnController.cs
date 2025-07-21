using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller responsible for operations related to Altinn CDN data
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/cdn")]
    public class AltinnCdnController : ControllerBase
    {
        private readonly ILogger<AltinnCdnController> _logger;
        private readonly IAltinnCdnService _altinnCdnService;

        /// <summary>
        /// Initializes a new instance of the <see cref="AltinnCdnController"/> class.
        /// </summary>
        /// <param name="logger">The logger instance.</param>
        /// <param name="altinnCdnService">Service implementation for Altinn CDN operations.</param>
        public AltinnCdnController(
            ILogger<AltinnCdnController> logger,
            IAltinnCdnService altinnCdnService)
        {
            _logger = logger;
            _altinnCdnService = altinnCdnService;
        }

        /// <summary>
        /// Retrieves organization data from the Altinn CDN.
        /// </summary>
        /// <returns>A dictionary containing organization data, where the key is the organization code and the value is the organization data object.</returns>
        [HttpGet]
        [Authorize]
        [Route("orgdata")]
        public async Task<ActionResult<Dictionary<string, OrgData>>> GetOrgData()
        {
            try
            {
                var orgData = await _altinnCdnService.GetOrgData();
                
                return Ok(orgData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving organization data");
                return StatusCode(500, "An error occurred while retrieving organization data");
            }
        }
    }
}
