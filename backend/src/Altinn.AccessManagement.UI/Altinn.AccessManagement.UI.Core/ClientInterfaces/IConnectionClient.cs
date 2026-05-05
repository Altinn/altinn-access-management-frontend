using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
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
        /// <param name="includeClientDelegations">Whether to include client delegations in the response.</param>
        /// <param name="includeAgentConnections">Whether to include agent connections in the response.</param>
        /// <returns> A list of <see cref="Connection"/> objects representing the connections between the given parties.</returns>
        Task<List<Connection>> GetConnections(
            Guid party,
            Guid? from,
            Guid? to,
            bool includeClientDelegations = true,
            bool includeAgentConnections = true);

        /// <summary>
        /// Gets simplified connections for a party.
        /// This is a limited endpoint for instance admins without full admin access.
        /// </summary>
        /// <param name="party">The party UUID.</param>
        /// <returns>A list of simplified connections.</returns>
        Task<List<SimplifiedConnection>> GetSimplifiedConnections(Guid party);

        /// <summary> Creates a connection between the authenticated user's selected party and the specified target party by assigning them as a right holder, where the target party is a self-identified user that does not have an existing account in the system. The method will first create a new self-identified user account based on the provided information, and then create the right holder connection to that new account.
        /// </summary> 
        /// <param name="from">The GUID of the SI-user</param>
        /// <param name="to">The GUID of the email-user or person logged adding from-party</param>
        /// <param name="cancellationToken"><see cref="CancellationToken"/></param>
        /// <returns>The guid of the newly added rightholder</returns>
        Task<AssignmentDto> PostNewSelfIdentifiedUser(Guid from, Guid to, CancellationToken cancellationToken = default);
    }
}
