using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the delegation client. Processes and maps the required data to the frontend model
    /// </summary>
    public class LookupService : ILookupService
    {
        private readonly ILogger _logger;        
        private readonly ILookupClient _lookupClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationsService"/> class.
        /// </summary>
        /// <param name="logger">handler for logger</param>
        /// <param name="lookupClient">handler for profile client</param>
        public LookupService(
            ILogger<ILookupService> logger,
            ILookupClient lookupClient)
        {
            _logger = logger;
            _lookupClient = lookupClient;
        }

        /// <inheritdoc/>        
        public async Task<Party> GetOrganisation(string organisationNumber)
        {
            Party partyInfo = await _lookupClient.GetOrganisation(organisationNumber);
            return partyInfo;           
        }

        /// <inheritdoc/>        
        public async Task<Party> GetPartyFromReporteeListIfExists(int partyId)
        {
            Party partyInfo = await _lookupClient.GetPartyFromReporteeListIfExists(partyId);
            return partyInfo;
        }
    }
}
