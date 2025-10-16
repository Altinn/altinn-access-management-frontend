using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for delegations
    /// </summary>
    public interface IConnectionService
    {
        /// <summary>
        /// Gets the right holders of a given reportee
        /// </summary>
        /// <param name="partyId">The party Id of the reportee</param>
        /// <returns>List of right holders</returns>
        Task<List<User>> GetReporteeConnections(int partyId);

        /// <summary>
        /// Checks that a person with the provided ssn and lastname exists. If they do, the person's partyUuid is returned.
        /// </summary>
        /// <param name="ssn">The ssn of the user</param>
        /// <param name="lastname">The last name of the user</param>
        /// <returns>The person's partyUuid if ssn and lastname correspond to the same person. Returns null if matching person is not found</returns>
        Task<Guid?> ValidatePerson(string ssn, string lastname);

        /// <summary>
        ///     Revokes all rights associated with a right holder by revoking their status as a right holder for another party.
        /// </summary>
        /// <param name="party">The GUID identifying the party for which to revoke right holders.</param>
        /// <param name="from">The GUID identifying the party from which to revoke right holders.</param>
        /// <param name="to">The GUID identifying the party to which to revoke right holders.</param>
        /// <returns>HttpResponseMessage indicating whether the action was successful.</returns>
        Task<HttpResponseMessage> RevokeRightHolderConnection(Guid party, Guid? from, Guid? to);

        /// <summary>
        /// Endpoint for adding a new party as a right holder to reportee party.
        /// </summary>
        /// <param name="partyUuid">The uuid of the reportee party</param>
        /// <param name="rightholderPartyUuid">The uuid of the party that will become a rightHolder</param>
        /// <returns>The result of the adding</returns>
        Task<HttpResponseMessage> AddReporteeRightHolderConnection(Guid partyUuid, Guid rightholderPartyUuid);

        /// <summary>
        /// Endpoint for getting all right holders for a given party, from a given party to a given party.
        /// </summary>
        /// <param name="party">The uuid of the reportee party</param>
        /// <param name="from">The uuid of the party from which to get right holders</param>
        /// <param name="to">The uuid of the party to which to get right holders</param>
        /// <returns> A list of RightHolderInfo </returns>
        Task<List<Connection>> GetConnections(Guid party, Guid? from, Guid? to);
    }
}
