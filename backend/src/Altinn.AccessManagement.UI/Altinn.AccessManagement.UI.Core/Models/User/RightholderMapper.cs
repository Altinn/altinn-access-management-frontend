namespace Altinn.AccessManagement.UI.Core.Models.User;

using System;
using System.Collections.Generic;
using System.Linq;
using Altinn.AccessManagement.UI.Core.Enums;

/// <summary>
/// Provides mapping and transformation logic from <see cref="RightHolderInfo"/> objects to <see cref="User"/> objects.
/// Handles the organization of users and their roles, including hierarchical relationships.
/// </summary>
public static class RightholderMapper
{
    private const string OrganizationTypeId = "8c216e2f-afdd-4234-9ba2-691c727bb33d";

    private static AuthorizedPartyType MapUserType(string typeId) =>
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
    /// Processes a list of <see cref="RightHolderInfo"/> objects and maps them to a list of <see cref="User"/> objects.
    /// </summary>
    /// <param name="rightholders">The list of <see cref="RightHolderInfo"/> objects to process.</param>
    /// <returns>A list of <see cref="User"/> objects representing the processed rightholders.</returns>
    public static List<User> MapRightholdersToUsers(List<RightHolderInfo> rightholders)
    {
        if (rightholders == null)
        {
            return new List<User>();
        }

        var userMap = new Dictionary<Guid, User>();
        var inheritingUsers = new List<RightHolderInfo>();

        // Find all top-level facilitators and users
        foreach (var rh in rightholders)
        {
            var userId = rh.To.Id;
            var roleName = rh.Role?.Name;
            var userType = MapUserType(rh.To.TypeId.ToString());

            if (userType == AuthorizedPartyType.Organization ||
                (userType == AuthorizedPartyType.Person && rh.IsDirect && !rh.IsParent && !rh.IsRoleMap && !rh.IsKeyRole))
            {
                if (!userMap.TryGetValue(userId, out var user))
                {
                    var roles = new List<string>();
                    AddUniqueRole(roles, roleName);

                    userMap[userId] = new User
                    {
                        PartyUuid = userId,
                        PartyType = userType,
                        Name = rh.To.Name,
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
                inheritingUsers.Add(rh);
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
                if (userMap.TryGetValue(userId, out var topNode))
                {
                    AddUniqueRole(topNode.Roles, roleName);
                }
            }
            
            if (facilitatorId.HasValue && userMap.TryGetValue(facilitatorId.Value, out var facilitator))
            {
                if (rh.IsRoleMap)
                {
                    if (userMap.TryGetValue(userId, out var topNode))
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
                            PartyType = MapUserType(rh.To.TypeId.ToString()),
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

        return userMap.Values.ToList();
    }
}