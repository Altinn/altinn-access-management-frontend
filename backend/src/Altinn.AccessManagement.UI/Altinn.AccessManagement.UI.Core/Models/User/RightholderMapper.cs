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
    /// The type identifier representing an organization.
    /// </summary>
    private const string OrganizationTypeId = "8c216e2f-afdd-4234-9ba2-691c727bb33d";

    /// <summary>
    /// Maps a type identifier to an <see cref="AuthorizedPartyType"/>.
    /// </summary>
    /// <param name="typeId">The type identifier to map.</param>
    /// <returns>The corresponding <see cref="AuthorizedPartyType"/>.</returns>
    private static AuthorizedPartyType MapUserType(string typeId) =>
        typeId == OrganizationTypeId ? AuthorizedPartyType.Organization : AuthorizedPartyType.Person;

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

        var topLevelUsers = new Dictionary<Guid, User>();
        var inheritingUsers = new List<RightHolderInfo>();
        var roleSets = new Dictionary<Guid, HashSet<string>>();

        foreach (var rh in rightholders)
        {
            var userId = rh.To.Id;
            var roleName = rh.Role?.Name;
            if (IsTopLevelUser(rh))
            {
                if (!topLevelUsers.TryGetValue(userId, out var user))
                {
                    var roles = string.IsNullOrEmpty(roleName) ? new HashSet<string>() : new HashSet<string> { roleName };
                    roleSets[userId] = roles;
                    topLevelUsers[userId] = new User
                    {
                        PartyUuid = userId,
                        PartyType = MapUserType(rh.To.TypeId.ToString()),
                        Name = rh.To.Name,
                        Roles = roles.ToList(),
                        InheritingUsers = new List<User>()
                    };
                }
                else
                {
                    if (!string.IsNullOrEmpty(roleName))
                    {
                        (roleSets[userId] ??= new HashSet<string>()).Add(roleName);
                    }

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
            var roleName = rh.Role?.Name;
            if (!facilitatorId.HasValue || !topLevelUsers.TryGetValue(facilitatorId.Value, out var facilitator)) continue;

            if (rh.IsRoleMap)
            {
                if (topLevelUsers.TryGetValue(userId, out var topNode) && !string.IsNullOrEmpty(roleName))
                {
                    (roleSets[userId] ??= new HashSet<string>()).Add(roleName);
                    topNode.Roles = roleSets[userId].ToList();
                }
            }
            else
            {
                var existing = facilitator.InheritingUsers.FirstOrDefault(u => u.PartyUuid == userId);
                if (existing == null)
                {
                    var roles = string.IsNullOrEmpty(roleName) ? new HashSet<string>() : new HashSet<string> { roleName };
                    facilitator.InheritingUsers.Add(new User
                    {
                        PartyUuid = userId,
                        PartyType = MapUserType(rh.To.TypeId.ToString()),
                        Name = rh.To.Name,
                        Roles = roles.ToList(),
                        InheritingUsers = new List<User>()
                    });
                    roleSets[userId] = roles;
                }
                else
                {
                    if (!string.IsNullOrEmpty(roleName)) {
                        (roleSets[userId] ??= new HashSet<string>()).Add(roleName);
                    }
                    
                    existing.Roles = roleSets[userId].ToList();
                }
            }
        }

        return topLevelUsers.Values.ToList();
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
}