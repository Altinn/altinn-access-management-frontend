using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Responsible for presenting the list of registered system to UI. 
    /// </summary>
    [Route("accessmanagement/api/v1/systemregister")]
    [ApiController] 
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class SystemRegisterController : ControllerBase
    {
        private readonly ISystemRegisterService _systemRegisterService;

        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemRegisterController"/> class.
        /// </summary>
        public SystemRegisterController(ISystemRegisterService systemRegisterService, IHttpContextAccessor httpContextAccessor)
        {
            _systemRegisterService = systemRegisterService;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Get list of registered systems.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public async Task<ActionResult> GetListOfRegisteredSystems(CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            List<RegisteredSystemFE> lista = await _systemRegisterService.GetSystems(languageCode, cancellationToken);

            return Ok(lista);
        }

        /// <summary>
        /// Get rights for a single system
        /// </summary>
        /// <param name="systemId">The system to get rights from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("rights/{systemId}")]
        public async Task<ActionResult> GetSystemRights(string systemId, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            List<ServiceResourceFE> rights = await _systemRegisterService.GetSystemRights(languageCode, systemId, cancellationToken);

            return Ok(rights);
        }
    }
}