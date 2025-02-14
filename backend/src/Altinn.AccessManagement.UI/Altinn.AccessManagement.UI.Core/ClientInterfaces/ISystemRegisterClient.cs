using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with the system register API
    /// </summary>
    public interface ISystemRegisterClient
    {
        /// <summary>
        /// Get all visible, non-deleted registered systems in the system register
        /// </summary>
        /// <param name="cancellationToken">CancellationToken token</param>
        /// <returns>
        /// A list of registered systems
        /// </returns>
        Task<List<RegisteredSystem>> GetSystems(CancellationToken cancellationToken);

        /// <summary>
        /// Get a specific system in the system register
        /// </summary>
        /// <param name="systemId">The system to get</param>
        /// <param name="cancellationToken">CancellationToken token</param>
        /// <returns>
        /// The requested system
        /// </returns>
        Task<RegisteredSystem> GetSystem(string systemId, CancellationToken cancellationToken);
    }
}
