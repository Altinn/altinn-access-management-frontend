using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// The "middleware" between the BFF's SystemUserAPI and Altinn's real SystemUserAPI in the Authentication Component
    /// </summary>
    public interface ISystemUserService
    {
        /// <summary>
        /// Return all system users created for a given party
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all system users for specified party</returns>
        Task<Result<List<SystemUserFE>>> GetAllSystemUsersForParty(int partyId, string languageCode, CancellationToken cancellationToken);
        
        /// <summary>
        /// Return a specific system user
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="id">Id of system user to get</param>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Requested system user</returns>
        Task<SystemUserFE> GetSpecificSystemUser(int partyId, Guid id, string languageCode, CancellationToken cancellationToken);

        /// <summary>
        /// Return all agent system users created for a given party
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all agent system users for specified party</returns>
        Task<Result<List<SystemUserFE>>> GetAgentSystemUsersForParty(int partyId, string languageCode, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes agent system user
        /// </summary>
        /// <param name="partyId">The party Id of the party</param>
        /// <param name="systemUserId">Id of system user to delete</param>
        /// <param name="partyUuid">The party uuid of the party</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean whether delete was successful or not</returns>
        Task<Result<bool>> DeleteAgentSystemUser(int partyId, Guid systemUserId, Guid partyUuid, CancellationToken cancellationToken);

        /// <summary>
        /// Create a new system user
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="newSystemUser">Object with IntegrationTitle and SystemId for new system user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Created system user, or specific error if creation fails</returns>
        Task<Result<SystemUser>> CreateSystemUser(int partyId, NewSystemUserRequest newSystemUser, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes system user
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="id">Id of system user to delete</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean whether delete was successful or not</returns>
        Task<bool> DeleteSystemUser(int partyId, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Update system user fields
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to update</param>
        /// <param name="systemUserData">System user data to update</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        Task<bool> UpdateSystemUser(int partyId, Guid systemUserGuid, SystemUserUpdate systemUserData, CancellationToken cancellationToken);
    }
}