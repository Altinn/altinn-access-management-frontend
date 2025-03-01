using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for service to get systems from the system register
    /// </summary>
    public interface ISystemRegisterService
    {
        /// <summary>
        /// Get all visible, non-deleted registered systems in the system register
        /// </summary>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>
        /// A list of all visible, non-deleted registered systems
        /// </returns>
        Task<List<RegisteredSystemFE>> GetSystems(string languageCode, CancellationToken cancellationToken);

        /// <summary>
        /// Get rights of a specific system in the system register
        /// </summary>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="systemId">The system to get rights from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>
        /// A list of frontend resource objects (with logo) and access packages
        /// </returns>
        Task<RegisteredSystemRightsFE> GetSystemRights(string languageCode, string systemId, CancellationToken cancellationToken);
    }
}