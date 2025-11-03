using System.Collections.Generic;
using System.Linq;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class RoleService : IRoleService
    {
        private readonly IRoleClient _roleClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleService"/> class.
        /// </summary>
        /// <param name="roleClient">The role client.</param>
        public RoleService(IRoleClient roleClient)
        {
            _roleClient = roleClient;
        }
        
        // PaginatedResult<RolePermission> GetConnections(Guid party, Guid? to, Guid? from, string languageCode) --- IGNORE ---
        
        /// <inheritdoc />
        public async Task<List<RolePermission>> GetConnections(Guid party, Guid? to, Guid? from, string languageCode)
        {
            var paginated = await _roleClient.GetRoleConnections(party, to, from, languageCode);
            return paginated?.Items?.ToList() ?? new List<RolePermission>();
        }

        /// <inheritdoc />
        public Task RevokeRole(Guid from, Guid to, Guid party, Guid roleId)
        {
            return _roleClient.RevokeRole(from, to, party, roleId);
        }
    }
}
