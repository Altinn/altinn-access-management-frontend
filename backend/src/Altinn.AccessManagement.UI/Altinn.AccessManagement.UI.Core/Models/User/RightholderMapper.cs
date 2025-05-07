namespace Altinn.AccessManagement.UI.Core.Models.User;

using System.Collections.Generic;
using System.Linq;
using Altinn.AccessManagement.UI.Core.Enums;

/// <summary>
/// Provides mapping and transformation logic from <see cref="RightHolderInfo"/> objects to <see cref="User"/> objects.
/// Handles the organization of users and their roles, including hierarchical relationships.
/// </summary>
public static class RightholderMapper
{
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

        var topLevelUsers = BuildTopLevelUsers(rightholders, out var inheritingUsers, out var roleSets);
        AddInheritingUsers(inheritingUsers, topLevelUsers, roleSets);

        return topLevelUsers.Values.ToList();
    }

    /// <summary>
    /// The type identifier representing an organization.
    /// </summary>
    private const string OrganizationTypeId = "8c216e2f-afdd-4234-9ba2-691c727bb33d";

    /// <summary>
    /// Maps a type identifier to an <see cref="AuthorizedPartyType"/>.
    /// </summary>
    /// <param name="typeId">The type identifier to map.</param>
    /// <returns>The corresponding <see cref="AuthorizedPartyType"/>.</returns>
    private static AuthorizedPartyType MapUserType(string typeId) => typeId switch
    {
        OrganizationTypeId => AuthorizedPartyType.Organization,
        _ => AuthorizedPartyType.Person
    };

    /// <summary>
    /// Adds a unique role to the set of roles if it is not null or empty.
    /// </summary>
    /// <param name="roles">The set of roles to add to.</param>
    /// <param name="role">The role to add.</param>
    private static void AddUniqueRole(HashSet<string> roles, string role)
    {
        if (!string.IsNullOrEmpty(role))
        {
            roles.Add(role);
        }
    }

    /// <summary>
    /// Determines if a <see cref="RightHolderInfo"/> object represents a top-level user.
    /// </summary>
    /// <param name="rh">The <see cref="RightHolderInfo"/> object to check.</param>
    /// <returns><c>true</c> if the object represents a top-level user; otherwise, <c>false</c>.</returns>
    private static bool IsTopLevelUser(RightHolderInfo rh)
    {
        var userType = MapUserType(rh.To.TypeId.ToString());
        return userType == AuthorizedPartyType.Organization || (rh.IsDirect && !rh.IsParent && !rh.IsRoleMap && !rh.IsKeyRole);
    }

    /// <summary>
    /// Builds a dictionary of top-level users from the provided rightholders.
    /// Separates inheriting users and collects role sets for each user.
    /// </summary>
    /// <param name="rightholders">The list of <see cref="RightHolderInfo"/> objects.</param>
    /// <param name="inheritingUsers">Output list of inheriting users.</param>
    /// <param name="roleSets">Output dictionary of user roles keyed by user ID.</param>
    /// <returns>A dictionary of top-level users keyed by their unique identifier.</returns>
    private static Dictionary<Guid, User> BuildTopLevelUsers(
        List<RightHolderInfo> rightholders,
        out List<RightHolderInfo> inheritingUsers,
        out Dictionary<Guid, HashSet<string>> roleSets)
    {
        var topLevelUsers = new Dictionary<Guid, User>();
        inheritingUsers = new List<RightHolderInfo>();
        roleSets = new Dictionary<Guid, HashSet<string>>();

        foreach (var rightholder in rightholders)
        {
            if (IsTopLevelUser(rightholder))
            {
                AddOrUpdateTopLevelUser(rightholder, topLevelUsers, roleSets);
            }
            else
            {
                inheritingUsers.Add(rightholder);
            }
        }

        return topLevelUsers;
    }

    /// <summary>
    /// Adds a new top-level user or updates an existing one with a new role.
    /// </summary>
    /// <param name="rightholder">The <see cref="RightHolderInfo"/> representing the user.</param>
    /// <param name="topLevelUsers">Dictionary of top-level users.</param>
    /// <param name="roleSets">Dictionary of user roles keyed by user ID.</param>
    private static void AddOrUpdateTopLevelUser(
        RightHolderInfo rightholder,
        Dictionary<Guid, User> topLevelUsers,
        Dictionary<Guid, HashSet<string>> roleSets)
    {
        var userId = rightholder.To.Id;
        if (!topLevelUsers.TryGetValue(userId, out var user))
        {
            var roles = new HashSet<string> { rightholder.Role.Name };
            roleSets[userId] = roles;
            topLevelUsers[userId] = new User
            {
                PartyUuid = userId,
                PartyType = MapUserType(rightholder.To.TypeId.ToString()),
                Name = rightholder.To.Name,
                Roles = roles.ToList(),
                InheritingUsers = new List<User>()
            };
        }
        else
        {
            AddUniqueRole(roleSets[userId], rightholder.Role.Name);
            user.Roles = roleSets[userId].ToList();
        }
    }

    /// <summary>
    /// Adds inheriting users to their facilitators and updates their roles.
    /// </summary>
    /// <param name="inheritingUsers">List of inheriting <see cref="RightHolderInfo"/> objects.</param>
    /// <param name="topLevelUsers">Dictionary of top-level users.</param>
    /// <param name="roleSets">Dictionary of user roles keyed by user ID.</param>
    private static void AddInheritingUsers(
        List<RightHolderInfo> inheritingUsers,
        Dictionary<Guid, User> topLevelUsers,
        Dictionary<Guid, HashSet<string>> roleSets)
    {
        foreach (var rightholder in inheritingUsers)
        {
            var userId = rightholder.To.Id;
            var facilitatorId = rightholder.Facilitator?.Id;

            if (!facilitatorId.HasValue || !topLevelUsers.TryGetValue(facilitatorId.Value, out var facilitator))
            {
                continue;
            }

            if (rightholder.IsRoleMap)
            {
                if (topLevelUsers.TryGetValue(userId, out var topNode))
                {
                    AddUniqueRole(roleSets[userId], rightholder.Role.Name);
                    topNode.Roles = roleSets[userId].ToList();
                }
            }
            else
            {
                var existingInheritingUser = facilitator.InheritingUsers
                    .FirstOrDefault(user => user.PartyUuid == userId);

                if (existingInheritingUser == null)
                {
                    var roles = new HashSet<string> { rightholder.Role.Name };
                    var inheritingUser = new User
                    {
                        PartyUuid = userId,
                        PartyType = MapUserType(rightholder.To.TypeId.ToString()),
                        Name = rightholder.To.Name,
                        Roles = roles.ToList(),
                        InheritingUsers = new List<User>()
                    };
                    facilitator.InheritingUsers.Add(inheritingUser);
                    roleSets[userId] = roles;
                }
                else
                {
                    AddUniqueRole(roleSets[userId], rightholder.Role.Name);
                    existingInheritingUser.Roles = roleSets[userId].ToList();
                }
            }
        }
    }
}