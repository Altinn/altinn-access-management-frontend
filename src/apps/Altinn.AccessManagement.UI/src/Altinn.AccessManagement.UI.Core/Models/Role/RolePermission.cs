using System.Collections.Generic;
using System.Linq;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using AccessManagementRole = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Core.Models.Role;

/// <summary>
/// Represents a role connection with its permissions.
/// </summary>
public class RolePermission
{
    /// <summary>
    /// The role metadata.
    /// </summary>
    public AccessManagementRole Role { get; set; }

    /// <summary>
    /// Permissions attached to the role.
    /// </summary>
    public IEnumerable<Permission> Permissions { get; set; } = Enumerable.Empty<Permission>();
}
