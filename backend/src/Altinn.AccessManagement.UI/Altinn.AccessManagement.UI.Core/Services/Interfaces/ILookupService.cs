using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

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
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>
        /// Party information
        /// </returns>
        Task<PartyFE> GetPartyForOrganization(string organizationNumber, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets a Party using the provided uuid.
        /// </summary>
        /// <param name="userUuid">The uuid of the user</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Party information for the GUI</returns>
        Task<PartyFE> GetPartyFromLoggedInUser(Guid userUuid, CancellationToken cancellationToken = default);
    }
}
