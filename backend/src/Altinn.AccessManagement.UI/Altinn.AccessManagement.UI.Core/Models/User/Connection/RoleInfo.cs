namespace Altinn.AccessManagement.UI.Core.Models.User;

/// <summary>
/// Represents a role involved in a delegation, including identifiers, descriptive information, and metadata.
/// </summary>
public class RoleInfo
{
    /// <summary>
    /// Id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Code
    /// </summary>
    public string Code { get; set; }

    /// <summary>
    /// Children
    /// </summary>
    public List<RoleInfo> Children { get; set; } = new();
}
