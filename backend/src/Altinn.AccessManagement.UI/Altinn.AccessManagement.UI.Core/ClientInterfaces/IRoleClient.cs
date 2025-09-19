using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for role client
    /// </summary>
    public interface IRoleClient
    {
        /// <summary>
        /// Fetch a single role by id
        /// </summary>
        /// <param name="languageCode">the language to use in texts returned</param>
        /// <param name="id">the id of the role</param>
        /// <returns>The role</returns>
        Task<Role> GetRoleById(string languageCode, Guid id);
    }
}
