namespace Altinn.AccessManagement.UI.Core.Models.User;

using Altinn.AccessManagement.UI.Core.Enums;

/// <summary>
/// Provides mapping and transformation logic from <see cref="Connection"/> objects to <see cref="User"/> objects.
/// Handles the organization of users and their roles, including hierarchical relationships.
/// </summary>
public static class ConnectionMapper
{
    private static readonly Guid OrganizationTypeId = new Guid("8c216e2f-afdd-4234-9ba2-691c727bb33d");

    private static AuthorizedPartyType MapUserType(Guid typeId) =>
        typeId == OrganizationTypeId ? AuthorizedPartyType.Organization : AuthorizedPartyType.Person;

    /// <summary>
    /// Adds a role to the list if it does not already exist and is not null or empty.
    /// </summary>
    private static void AddUniqueRole(List<string> roles, string role)
    {
        if (!string.IsNullOrEmpty(role) && !roles.Contains(role))
        {
            roles.Add(role);
        }
    }

    /// <summary>
    /// Processes a list of <see cref="Connection"/> objects and maps them to a list of <see cref="User"/> objects to be used in the reportee view.
    /// </summary>
    /// <param name="connections">The list of <see cref="Connection"/> objects to process.</param>
    /// <returns>A list of <see cref="User"/> objects representing the processed reportees.</returns>
    public static List<User> MapToReportees(List<Connection> connections)
    {
        if (connections == null)
        {
            return new List<User>();
        }

        var reporteeMap = new Dictionary<Guid, User>();
        var subunits = new List<Connection>();

        foreach (var connection in connections)
        {
            if (connection.IsDirect)
            {
                var fromId = connection.From.Id;
                var fromType = MapUserType(connection.From.TypeId);
                var roleName = connection.Role?.Name;
                var userType = MapUserType(connection.From.TypeId);

                if (reporteeMap.TryGetValue(fromId, out var reportee))
                {
                    AddUniqueRole(reportee.Roles, roleName);
                }
                else
                {
                    reportee = new User
                    {
                        PartyUuid = fromId,
                        PartyType = fromType,
                        Name = connection.From.Name,
                        Roles = new List<string> { },
                        InheritingUsers = new List<User>(),
                        OrganizationNumber = userType == AuthorizedPartyType.Organization ? connection.From.RefId : null,
                    };
                    AddUniqueRole(reportee.Roles, roleName);
                    reporteeMap[fromId] = reportee;
                }
            }
            else
            {
                subunits.Add(connection);
            }
        }

        foreach (var unit in subunits)
        {
            var userId = unit.From.Id;
            var parentId = unit.From.ParentId.Value;
            if (!unit.From.ParentId.HasValue)
            {
                continue;
            }

            var roleName = unit.Role?.Name;
            var userType = MapUserType(unit.From.TypeId);

            if (reporteeMap.TryGetValue(parentId, out var parent))
            {
                var inheritingUser = parent.InheritingUsers.FirstOrDefault(u => u.PartyUuid == userId);
                if (inheritingUser != null)
                {
                    AddUniqueRole(inheritingUser.Roles, roleName);
                }
                else
                {
                    var subunit = new User
                    {
                        PartyUuid = userId,
                        PartyType = userType,
                        Name = unit.From.Name,
                        Roles = new List<string> { },
                        InheritingUsers = null,
                        OrganizationNumber = userType == AuthorizedPartyType.Organization ? unit.From.RefId : null,
                    };
                    AddUniqueRole(subunit.Roles, roleName);
                    parent.InheritingUsers.Add(subunit);
                }
            }
        }

        return reporteeMap.Values.ToList();
    }

    /// <summary>
    /// Processes a list of <see cref="Connection"/> objects and maps them to a list of <see cref="User"/> objects to be used in the rightholder view.
    /// </summary>
    /// <param name="connections">The list of <see cref="Connection"/> objects to process.</param>
    /// <returns>A list of <see cref="User"/> objects representing the processed rightholders.</returns>
    public static List<User> MapToRightholders(List<Connection> connections)
    {
        if (connections == null)
        {
            return new List<User>();
        }

        var rightholderMap = new Dictionary<Guid, User>();
        var inheritingUsers = new List<Connection>();

        // Find all top-level nodes (users) and add them to the rightholderMap
        foreach (var connection in connections)
        {
            var userId = connection.To.Id;
            var roleName = connection.Role?.Name;
            var userType = MapUserType(connection.To.TypeId);

            if (userType == AuthorizedPartyType.Organization ||
                (userType == AuthorizedPartyType.Person
                    && connection.IsDirect
                    && !connection.IsParent
                    && !connection.IsRoleMap
                    && !connection.IsKeyRole))
            {
                if (!rightholderMap.TryGetValue(userId, out var user))
                {
                    var roles = new List<string>();
                    AddUniqueRole(roles, roleName);

                    rightholderMap[userId] = new User
                    {
                        PartyUuid = userId,
                        PartyType = userType,
                        Name = connection.To.Name,
                        Roles = roles,
                        InheritingUsers = new List<User>()
                    };
                }
                else
                {
                    AddUniqueRole(user.Roles, roleName);
                }
            }
            else
            {
                inheritingUsers.Add(connection);
            }
        }

        // Put the inheriting users into the correct facilitators and append inherited roles 
        foreach (var rh in inheritingUsers)
        {
            var userId = rh.To.Id;
            var facilitatorId = rh.Facilitator?.Id;
            var roleName = rh.Role?.Name;

            if (rh.IsDirect && !rh.IsParent && rh.IsRoleMap && !rh.IsKeyRole)
            {
                // This is a inherited role, so we need to add the role to the top node
                if (rightholderMap.TryGetValue(userId, out var topNode))
                {
                    AddUniqueRole(topNode.Roles, roleName);
                }
            }

            if (facilitatorId.HasValue && rightholderMap.TryGetValue(facilitatorId.Value, out var facilitator))
            {
                if (rh.IsRoleMap)
                {
                    if (rightholderMap.TryGetValue(userId, out var topNode))
                    {
                        AddUniqueRole(topNode.Roles, roleName);
                    }
                }
                else
                {
                    var existingInheritingUser = facilitator.InheritingUsers.FirstOrDefault(u => u.PartyUuid == userId);
                    if (existingInheritingUser == null)
                    {
                        var roles = new List<string>();
                        AddUniqueRole(roles, roleName);

                        var inheritingUser = new User
                        {
                            PartyUuid = userId,
                            PartyType = MapUserType(rh.To.TypeId),
                            Name = rh.To.Name,
                            Roles = roles,
                            InheritingUsers = new List<User>()
                        };
                        facilitator.InheritingUsers.Add(inheritingUser);
                    }
                    else
                    {
                        AddUniqueRole(existingInheritingUser.Roles, roleName);
                    }
                }
            }
        }

        return rightholderMap.Values.ToList();
    }
}