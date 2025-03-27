using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with the system user API
    /// </summary>
    public interface ISystemUserClient
    {
        /// <summary>
        /// Return a specific system user
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="id">Id of system user to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Requested system user</returns>
        Task<SystemUser> GetSpecificSystemUser(int partyId, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Create a new system user
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="newSystemUser">Object with IntegrationTitle and SystemId for new system user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Id of created system user, or specific error if creation fails</returns>
        Task<Result<SystemUser>> CreateNewSystemUser(int partyId, NewSystemUserRequest newSystemUser, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes system user
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="id">Id of system user to delete</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean whether delete was successful or not</returns>
        Task<bool> DeleteSystemUser(int partyId, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Return all system users created for a given party
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all system users for specified party</returns>
        Task<List<SystemUser>> GetSystemUsersForParty(int partyId, CancellationToken cancellationToken);

        /// <summary>
        /// Return a specific agent system user
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="id">Id of system user to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Requested agent system user</returns>
        Task<SystemUser> GetAgentSystemUser(int partyId, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Return all agent system users created for a given party
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all agent system users for specified party</returns>
        Task<List<SystemUser>> GetAgentSystemUsersForParty(int partyId, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes agent system user
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="systemUserId">Id of system user to delete</param>
        /// <param name="facilitatorId">Id of facilitator owning systemuser</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean whether delete was successful or not</returns>
        Task<Result<bool>> DeleteAgentSystemUser(int partyId, Guid systemUserId, Guid facilitatorId, CancellationToken cancellationToken);
    }
}