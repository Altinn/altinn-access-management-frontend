using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Register.Contracts.V1;

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
        public async Task<PartyFE> GetPartyForOrganization(string organizationNumber)
        {
            Party party = await _registerClient.GetPartyForOrganization(organizationNumber);
            return party == null ? null : new PartyFE(party);
        }

        /// <inheritdoc/>
        public async Task<PartyFE> GetPartyFromLoggedInUser(Guid userUuid)
        {
            return await GetPartyByUUID(userUuid);
        }
        
        private async Task<PartyFE> GetPartyByUUID(Guid uuid)
        {
            Altinn.Register.Contracts.Party partyFromRegistry = await _registerClient.GetParty(uuid);

            return partyFromRegistry == null ? null : new PartyFE(partyFromRegistry);
        }
    }
}
