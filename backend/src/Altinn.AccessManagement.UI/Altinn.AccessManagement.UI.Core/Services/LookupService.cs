using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with platform clients to lookup . Processes and maps the required data to the frontend model
    /// </summary>
    public class LookupService : ILookupService
    { 
        private readonly ILookupClient _lookupClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="LookupService"/> class.
        /// </summary>
        /// <param name="lookupClient">handler for profile client</param>
        /// <param name="registerClient">Client wrapper for platform register</param>
        public LookupService(ILookupClient lookupClient, IRegisterClient registerClient)
        {
            _lookupClient = lookupClient;
            _registerClient = registerClient;
        }

        /// <inheritdoc/>        
        public async Task<Party> GetPartyForOrganization(string organizationNumber)
        {
            return await _registerClient.GetPartyForOrganization(organizationNumber);
        }

        /// <inheritdoc/>        
        public async Task<Party> GetPartyFromReporteeListIfExists(int partyId)
        {
            Party partyInfo = await _lookupClient.GetPartyFromReporteeListIfExists(partyId);    
            return partyInfo;
        }

        /// <inheritdoc/>        
        public async Task<Party> GetPartyByUUID(Guid uuid)
        {
            List<Party> partyList = await _registerClient.GetPartyListByUUID(new List<Guid>() { uuid });
            return partyList?.FirstOrDefault();
        }
    }
}
