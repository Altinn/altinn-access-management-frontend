using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with access package metadata
    /// </summary>
    public interface IConnectionClient
    {
        /// <summary>
        /// Creates a connection between the authenticated user's selected party and the specified target party by assigning them as a right holder.
        /// </summary>
        /// <param name="party">The GUID identifying the party the authenticated user is acting on behalf of.</param>
        /// <param name="to">The GUID identifying the target party to which the assignment should be created. (only given for orgs)</param>
        /// <param name="personInput">Additional confirmation data if the rightholder to be added is a person (null if it is an org).</param>
        /// <param name="cancellationToken"><see cref="CancellationToken"/></param>
        /// <returns>The guid of the newly added rightholder</returns>
        Task<Guid> PostNewRightHolderConnection(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default);

        /// <summary>
        ///   Revokes all rights associated with a right holder connection by revoking their status as a right holder for another party.
        /// </summary>
        /// <param name="party">The GUID identifying the party for which to revoke right holders.</param>
        /// <param name="from">The GUID identifying the party from which to revoke right holders.</param>
        /// <param name="to">The GUID identifying the party to which to revoke right holders.</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeRightHolderConnection(Guid party, Guid? from, Guid? to);

        /// <summary>
        ///   Gets all connections between one party and one or more others.
        /// </summary>
        /// <param name="party">The GUID identifying the party for which to retrieve connections.</param>
        /// <param name="from">The GUID identifying the party from which to retrieve connections.</param>
        /// <param name="to">The GUID identifying the party to which to retrieve connections.</param>
        /// <returns> A list of <see cref="Connection"/> objects representing the connections between the given parties.</returns>
        Task<List<Connection>> GetConnections(Guid party, Guid? from, Guid? to);
    }
}
