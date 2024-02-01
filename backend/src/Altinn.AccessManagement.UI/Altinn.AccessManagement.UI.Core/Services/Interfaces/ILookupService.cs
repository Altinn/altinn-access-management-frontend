using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for lookup
    /// </summary>
    public interface ILookupService
    {
        /// <summary>
        /// Looks up party information for an organization based on the organization number
        /// </summary>
        /// <param name="organizationNumber">The organization number</param>
        /// <returns>
        /// Party information
        /// </returns>
        Task<Party> GetPartyForOrganization(string organizationNumber);

        /// <summary>
        /// Gets a Party based on partyId if the party is in the users reporteelist
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <returns>Party that corresponds to partyId parameter if it's in the users reporteelist</returns>
        Task<Party> GetPartyFromReporteeListIfExists(int partyId);

        /// <summary>
        /// Gets a Party based on provided uuid
        /// </summary>
        /// <param name="uuid">The uuid of the party</param>
        /// <returns>Party that corresponds to uuid parameter</returns>
        Task<Party> GetPartyByUUID(Guid uuid);
    }
}
