using Altinn.AccessManagement.UI.Core.Models;

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
        Task<PartyFE> GetPartyForOrganization(string organizationNumber);

        /// <summary>
        /// Gets a Party using the provided uuid.
        /// </summary>
        /// <param name="userUuid">The uuid of the user</param>
        /// <returns>Party information for the GUI</returns>
        Task<PartyFE> GetPartyFromLoggedInUser(Guid userUuid);
    }
}
