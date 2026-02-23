using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage;

/// <summary>
/// Permission
/// </summary>
public class Permission
{
    /// <summary>
    /// From party
    /// </summary>
    public CompactEntity From { get; set; }

    /// <summary>
    /// To party
    /// </summary>
    public CompactEntity To { get; set; }

    /// <summary>
    /// Via party
    /// </summary>
    public CompactEntity Via { get; set; }

    /// <summary>
    /// Role
    /// </summary>
    public CompactRole Role { get; set; }

    /// <summary>
    /// Via role
    /// </summary>
    public CompactRole ViaRole { get; set; }

    /// <summary>
    /// Reason for the permission
    /// </summary>
    public Reason Reason { get; set; }
}

/// <summary>
/// Reason model containing a list of reason items
/// </summary>
public class Reason
{
    /// <summary>
    /// List of reason items
    /// </summary>
    public List<ReasonItem> Items { get; set; }
}

/// <summary>
/// A single reason item with name and description
/// </summary>
public class ReasonItem
{
    /// <summary>
    /// Name of the reason
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Description of the reason
    /// </summary>
    public string Description { get; set; }
}

/// <summary>
/// Permission
/// </summary>
public class CompactPermission
{
    /// <summary>
    /// From party
    /// </summary>
    public CompactEntity From { get; set; }

    /// <summary>
    /// To party
    /// </summary>
    public CompactEntity To { get; set; }
}