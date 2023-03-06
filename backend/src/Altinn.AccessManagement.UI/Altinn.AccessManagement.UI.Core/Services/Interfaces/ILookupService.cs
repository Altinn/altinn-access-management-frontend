using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for lookup
    /// </summary>
    public interface ILookupService
    {
        /// <summary>
        /// Gets an organization for an organization number
        /// </summary>
        /// <param name="organisationNumber">the organisation number</param>
        /// <returns>organisation information</returns>
        public Task<Party> GetOrganisation(string organisationNumber);

        /// <summary>
        /// Gets a Party based on partyId if the party is in the users reporteelist
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <returns>Party that corresponds to partyId parameter if it's in the users reporteelist</returns>
        public Task<Party> GetPartyFromReporteeListIfExists(int partyId);
    }
}
