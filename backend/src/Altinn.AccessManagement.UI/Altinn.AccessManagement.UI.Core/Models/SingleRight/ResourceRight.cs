using Altinn.AccessManagement.UI.Core.Models.AccessPackage;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Model representing a resource with its associated rules and permissions
/// </summary>
public class ResourceRight
{
    /// <summary>
    /// The resource
    /// </summary>
    public required ResourceAM Resource { get; set; }

    /// <summary>
    /// List of direct rules and associated permissions for the resource
    /// </summary>
    public required List<RuleItem> DirectRules { get; set; }

    /// <summary>
    /// List of indirect rules and associated permissions for the resource
    /// </summary>
    public required List<RuleItem> IndirectRules { get; set; }
}

/// <summary>
/// Model representing a rule item with its rule definition, reason and permissions
/// </summary>
public class RuleItem
{
    /// <summary>
    /// The rule definition
    /// </summary>
    public required Rule Rule { get; set; }

    /// <summary>
    /// Reason for the rule
    /// </summary>
    public Reason Reason { get; set; }

    /// <summary>
    /// List of permissions associated with the rule
    /// </summary>
    public List<Permission> Permissions { get; set; }
}
