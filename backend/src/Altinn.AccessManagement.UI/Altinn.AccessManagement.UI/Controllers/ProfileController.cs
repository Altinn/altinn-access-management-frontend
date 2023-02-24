using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.Controllers
{
    /// <summary>
    /// The <see cref="ProfileController"/> provides the API endpoints related to persons.
    /// </summary>
    [Route("accessmanagement/api/v1/profile")]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileClient _profileClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProfileController"/> class
        /// </summary>
        public ProfileController(IProfileClient profileClient, IHttpContextAccessor httpContextAccessor, ILogger<ProfileController> logger)
        {
            _profileClient = profileClient;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        /// <summary>
        /// Method that returns the user information about the user that is logged in
        /// </summary>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet("user")]
        public async Task<ActionResult> GetUser()
        {
            try
            {
                var user = await _profileClient.GetUserProfile();

                if (user == null)
                {
                    return NotFound();
                }

                return Ok(user);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}
