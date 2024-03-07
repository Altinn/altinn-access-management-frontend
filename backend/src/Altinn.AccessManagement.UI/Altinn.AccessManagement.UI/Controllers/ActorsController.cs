using System.Net.Mime;
using Altinn.AccessManagement.UI.Models;
using Altinn.AccessManagement.UI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    [ApiController]
    [Route("accessmanagements/api/v1/[controller]")]
    public class ActorsController(IActorsService service)
    {
        private IActorsService Service { get; } = service;

        /// <summary>
        /// Endpoint for retrieving a user profile by uuid.
        /// </summary>
        /// <param name="uuid">The uuid for the user to look up</param>
        [Authorize]
        [HttpGet("users/{uuid}")]
        [Produces(MediaTypeNames.Application.Json, Type = typeof(UserModel))]
        public async Task<ActionResult<UserModel>> GetUser([FromRoute] Guid uuid) => await Service.GetUser(uuid);

        /// <summary>
        /// Retrieves an organization.
        /// </summary>
        /// <param name="organizationNumber"></param>
        [Authorize]
        [HttpGet("organizations/{uuid}")]
        [Produces(MediaTypeNames.Application.Json, Type = typeof(OrganizationModel))]
        public async Task<ActionResult<OrganizationModel>> GetOrganization([FromRoute] string organizationNumber) => await Service.GetOrganization(organizationNumber);
    }
}