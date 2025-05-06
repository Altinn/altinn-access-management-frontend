using Altinn.AccessManagement.UI.Core.Enums;
using System.Collections.Generic;
using System.Linq;

namespace Altinn.AccessManagement.UI.Core.Models.User;

/// <summary>
/// This class is responsible for processing rightholders and mapping them to user objects.
/// It handles the transformation of rightholder data into a structured format suitable for the application.
/// </summary>
public static class RightholderProcessor
{
    /// <summary>
    /// Maps a type identifier to an AuthorizedPartyType.
    /// </summary>
    /// <param name="typeId">The type identifier to map.</param>
    /// <returns>The corresponding AuthorizedPartyType.</returns>
    public static AuthorizedPartyType MapUserType(string typeId) => typeId switch
    {
        "8c216e2f-afdd-4234-9ba2-691c727bb33d" => AuthorizedPartyType.Organization,
        _ => AuthorizedPartyType.Person
    };

    /// <summary>
    /// Adds a unique role to the set of roles.
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
    /// Processes a list of RightHolderInfo objects and maps them to a list of User objects.
    /// </summary>
    /// <param name="rightholders">The list of RightHolderInfo objects to process.</param>
    /// <returns>A list of User objects representing the processed rightholders.</returns>
    public static List<User> ProcessRightholdersToUsers(List<RightHolderInfo> rightholders)
    {
        var topLevelUsers = new Dictionary<Guid, User>();
        var inheritingUsers = new List<RightHolderInfo>();
        var roleSets = new Dictionary<Guid, HashSet<string>>();

        foreach (var rh in rightholders)
        {
            var userType = MapUserType(rh.To.TypeId.ToString());
            if (
                userType == AuthorizedPartyType.Organization ||
                (userType == AuthorizedPartyType.Person &&
                    rh.IsDirect &&
                    !rh.IsParent &&
                    !rh.IsRoleMap &&
                    !rh.IsKeyRole))
            {
                var userId = rh.To.Id;
                if (!topLevelUsers.TryGetValue(userId, out var user))
                {
                    var roles = new HashSet<string> { rh.Role.Name };
                    roleSets[userId] = roles;
                    topLevelUsers[userId] = new User
                    {
                        PartyUuid = userId,
                        PartyType = userType,
                        Name = rh.To.Name,
                        Roles = roles.ToList(),
                        // OrganizationNumber = rh.To.RefId,
                        InheritingUsers = new List<User>()
                    };
                }
                else
                {
                    AddUniqueRole(roleSets[userId], rh.Role.Name);
                    user.Roles = roleSets[userId].ToList();
                }
            }
            else
            {
                inheritingUsers.Add(rh);
            }
        }

        foreach (var rh in inheritingUsers)
        {
            var userId = rh.To.Id;
            var facilitatorId = rh.Facilitator?.Id;

            if (facilitatorId.HasValue && topLevelUsers.TryGetValue(facilitatorId.Value, out var facilitator))
            {
                if (rh.IsRoleMap)
                {
                    if (topLevelUsers.TryGetValue(userId, out var topNode))
                    {
                        AddUniqueRole(roleSets[userId], rh.Role.Name);
                        topNode.Roles = roleSets[userId].ToList();
                    }
                }
                else
                {
                    var existingInheritingUser = facilitator.InheritingUsers
                        .FirstOrDefault(user => user.PartyUuid == userId);

                    if (existingInheritingUser == null)
                    {
                        var roles = new HashSet<string> { rh.Role.Name };
                        var inheritingUser = new User
                        {
                            PartyUuid = userId,
                            PartyType = MapUserType(rh.To.TypeId.ToString()),
                            Name = rh.To.Name,
                            Roles = roles.ToList(),
                            // OrganizationNumber = rh.To.RefId,
                            InheritingUsers = new List<User>()
                        };
                        facilitator.InheritingUsers.Add(inheritingUser);
                        roleSets[userId] = roles;
                    }
                    else
                    {
                        AddUniqueRole(roleSets[userId], rh.Role.Name);
                        existingInheritingUser.Roles = roleSets[userId].ToList();
                    }
                }
            }
        }

        return topLevelUsers.Values.ToList();
    }
}