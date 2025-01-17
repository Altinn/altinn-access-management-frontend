using Altinn.AccessManagement.UI.Core.Models.Role;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
        /// <summary>
        /// Service for access package logic
        /// </summary>
        public interface IRoleService
        {
                /// <summary>
                ///     Gets the roles for a user
                /// </summary>
                /// <param name="languageCode">languageCode.</param>
                /// <param name="rightOwnerUuid">the right owner to retrieve roles for</param>
                /// <param name="rightHolderUuid">the right holder to retrieve roles for</param>
                /// <returns></returns>
                Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid);
    }
}
