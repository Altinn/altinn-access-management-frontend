using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;

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
        Task<UserProfileFE> GetUserProfile(int userId);

        /// <summary>
        /// Get the reportees for the user 
        /// </summary>
        /// <param name="userId">The user id</param>
        /// <returns></returns>
        Task<List<User>> GetReporteeList(Guid userId);

        /// <summary>
        /// Gets a Party based on partyId if the party is in the users reporteelist
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <returns>Party that corresponds to partyId parameter if it's in the users reporteelist</returns>
        Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId);

        /// <summary>
        /// Endpoint for reportees the authenticated user can act on behalf of
        /// </summary>
        /// <returns>List of reportees</returns>
        Task<List<AuthorizedParty>> GetReporteeListForUser();

        /// <summary>
        /// Endpoint for getting the parties the authenticated user can act on behalf of, with connection info
        /// </summary>
        /// <returns>List of connections</returns>
        Task<List<Connection>> GetActorListForUser(Guid authenticatedUserPartyUuid);

        /// <summary>
        /// Function for getting the favorite actors of the authenticated user
        /// </summary>
        /// <returns>List of partyUuids</returns>
        Task<List<string>> GetFavoriteActorUuids();

        /// <summary>
        /// Adds a partyUuid to the user's favorite profile group in altinn profile
        /// </summary>
        /// <returns></returns>
        Task AddPartyUuidToFavorites(Guid partyUuid);

        /// <summary>
        /// Deletes a partyUuid from the user's favorite profile group in altinn profile
        /// </summary>
        /// <returns></returns>
        Task DeletePartyUuidFromFavorites(Guid partyUuid);
    }
}
