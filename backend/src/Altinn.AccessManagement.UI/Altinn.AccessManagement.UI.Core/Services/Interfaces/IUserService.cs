using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for delegations
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Gets the user's preferences from altinn profile
        /// </summary>
        /// <param name="userId">Id of user</param>
        /// <returns>users preferred settings</returns>
        Task<UserProfile> GetUserProfile(int userId);

        /// <summary>
        /// Gets a Party based on partyId if the party is in the users reporteelist
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <returns>Party that corresponds to partyId parameter if it's in the users reporteelist</returns>
        Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId);
    }
}
