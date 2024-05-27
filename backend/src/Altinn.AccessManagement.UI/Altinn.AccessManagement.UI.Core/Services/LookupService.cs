using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with platform clients to lookup processes and maps the required data to the frontend model
    /// </summary>
    public class LookupService : ILookupService
    {
        private readonly IRegisterClient _registerClient;
        private readonly IProfileClient _profileClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="LookupService"/> class.
        /// </summary>
        /// <param name="registerClient">Client wrapper for platform register</param>
        /// <param name="profileClient">profile client</param>
        public LookupService(IRegisterClient registerClient, IProfileClient profileClient)
        {
            _registerClient = registerClient;
            _profileClient = profileClient;
        }

        /// <inheritdoc/>        
        public async Task<Party> GetPartyForOrganization(string organizationNumber)
        {
            return await _registerClient.GetPartyForOrganization(organizationNumber);
        }

        /// <inheritdoc/>        
        public async Task<Party> GetPartyByUUID(Guid uuid)
        {
            // We fetch the party using the partyList endpoint because it has better performance than the one ment for singular party queries.
            // However, since we only ask for one uuid, we will still only get one party back.
            List<Party> partyList = await _registerClient.GetPartyList(new List<Guid>() { uuid });
            return partyList?.FirstOrDefault();
        }

        /// <inheritdoc/>        
        public async Task<UserProfile> GetUserByUUID(Guid uuid)
        {
            UserProfile user = await _profileClient.GetUserProfile(uuid);
            return user;
        }
    }
}
