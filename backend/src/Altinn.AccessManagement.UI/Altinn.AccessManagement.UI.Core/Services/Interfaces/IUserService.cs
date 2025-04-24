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
        /// Gets the right holders of a given reportee
        /// </summary>
        /// <param name="partyId">The party Id of the reportee</param>
        /// <returns>List of right holders</returns>
        Task<List<User>> GetReporteeRightHolders(int partyId);
        
        /// <summary>
        /// Gets all accesses of a given right holder for a reportee
        /// </summary>
        /// <param name = "from" > The uuid for the reportee which the right holder has access to</param>
        /// <param name="to">The uuid for the right holder whose accesses are to be returned</param>
        /// <returns>All right holder's accesses</returns>
        Task<UserAccesses> GetUserAccesses(Guid from, Guid to);

        /// <summary>
        /// Checks that a person with the provided ssn and lastname exists. If they do, the person's partyUuid is returned.
        /// </summary>
        /// <param name="ssn">The ssn of the user</param>
        /// <param name="lastname">The last name of the user</param>
        /// <returns>The person's partyUuid if ssn and lastname correspond to the same person. Returns null if matching person is not found</returns>
        Task<Guid?> ValidatePerson(string ssn, string lastname);

        /// <summary>
        /// Endpoint for adding a new party as a right holder to reportee party.
        /// </summary>
        /// <param name="partyUuid">The uuid of the reportee party</param>
        /// <param name="rightholderPartyUuid">The uuid of the party that will become a rightHolder</param>
        /// <returns>The result of the adding</returns>
        Task<HttpResponseMessage> AddReporteeRightHolder(Guid partyUuid, Guid rightholderPartyUuid);
    }
}
