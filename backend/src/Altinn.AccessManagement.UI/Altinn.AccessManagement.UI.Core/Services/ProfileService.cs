using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Profile.Models;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the delegation client. Processes and maps the required data to the frontend model
    /// </summary>
    public class ProfileService : IProfileService
    {
        private readonly ILogger _logger;
        private readonly IDelegationsClient _delegationsClient;
        private readonly IProfileClient _profileClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationsService"/> class.
        /// </summary>
        /// <param name="logger">handler for logger</param>
        /// <param name="delegationsClient">handler for delegations client</param>
        /// <param name="profileClient">handler for profile client</param>
        public ProfileService(
            ILogger<IDelegationsService> logger,
            IDelegationsClient delegationsClient,           
            IProfileClient profileClient)
        {
            _logger = logger;
            _delegationsClient = delegationsClient;
            _profileClient = profileClient;
        }

        /// <inheritdoc/>        
        public async Task<UserProfile> GetUserProfile()
        {
            UserProfile userProfile = await _profileClient.GetUserProfile();
            return userProfile;           
        }
    }
}
