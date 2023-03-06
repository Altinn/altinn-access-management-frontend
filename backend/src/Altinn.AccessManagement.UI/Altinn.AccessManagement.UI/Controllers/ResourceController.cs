using Altinn.AccessManagement.Core.UI.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller to update AccessManagement with resources existing i ResourceRegister.
    /// </summary>
    [ApiController]
    public class ResourceController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly IResourceAdministrationPoint _rap;

        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceController"/> class.
        /// </summary>
        /// <param name="logger">the logger.</param>
        /// <param name="resourceAdministrationPoint">The resource administration point</param>
        /// <param name="mapper">mapper handler</param>
        public ResourceController(
            ILogger<ResourceController> logger,
            IResourceAdministrationPoint resourceAdministrationPoint)
        {
            _logger = logger;
            _rap = resourceAdministrationPoint;
        }

        /// <summary>
        /// Get list of maskinprotenschema resources
        /// </summary>
        /// <param name="party">the partyid</param>
        /// <returns></returns>
        [HttpGet]
        [Route("accessmanagement/api/v1/{party}/resources/maskinportenschema")]
        public async Task<ActionResult<List<ServiceResourceFE>>> Get([FromRoute] int party)
        {
            List<ServiceResourceFE> resources = await _rap.GetResources(ResourceType.MaskinportenSchema);
            return resources;
        }
    }
}
