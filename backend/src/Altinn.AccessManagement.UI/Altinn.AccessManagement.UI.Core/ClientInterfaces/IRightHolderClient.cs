using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with access package metadata
    /// </summary>
    public interface IRightHolderClient
    {
        /// <summary>
        /// Creates an assignment between the authenticated user's selected party and the specified target party.
        /// </summary>
        /// <param name="party">The GUID identifying the party the authenticated user is acting on behalf of.</param>
        /// <param name="to">The GUID identifying the target party to which the assignment should be created.</param>
        /// <param name="cancellationToken"><see cref="CancellationToken"/></param>
        Task<HttpResponseMessage> PostNewRightHolder(Guid party, Guid to, CancellationToken cancellationToken = default);

        /// <summary>
        ///   Revokes all rights associated with a right holder by revoking their status as a right holder for another party.
        /// </summary>
        /// <param name="party">The uuid pf the reportee party, from which the right holder is have their rights revoked</param>
        /// <param name="to">The party that is to lose their right holder status</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeRightHolder(Guid party, Guid? from, Guid? to);

        /// <summary>
        ///   Gets all right holders for a given party.
        /// </summary>
        /// <param name="party">The GUID identifying the party for which to retrieve right holders.</param>
        /// <param name="from">The GUID identifying the party from which to retrieve right holders.</param>
        /// <param name="to">The GUID identifying the party to which to retrieve right holders.</param>
        /// <returns> A list of <see cref="Connection"/> objects representing the right holders.</returns>
        Task<List<Connection>> GetRightHolders(Guid party, Guid? from, Guid? to);
    }
}
