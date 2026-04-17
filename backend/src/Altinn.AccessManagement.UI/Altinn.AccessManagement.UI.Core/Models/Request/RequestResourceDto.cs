namespace Altinn.AccessManagement.UI.Core.Models.Request;

/// <summary>
/// Response dto for a resource request
/// </summary>
public class RequestResourceDto : RequestDto
{
    /// <summary>
    /// Resource that is requested
    /// </summary>
    public ResourceReferenceDto Resource { get; set; }

    /// <summary>
    /// Package that is requested
    /// </summary>
    public PackageReferenceDto Package { get; set; }
}

/// <summary>
/// Resource reference
/// </summary>
public class ResourceReferenceDto
{
    /// <summary>
    /// Identifying the resource
    /// </summary>
    public string ReferenceId { get; set; }
}

/// <summary>
/// Package reference
/// </summary>
public class PackageReferenceDto
{
    /// <summary>
    /// Identifying the package
    /// </summary>
    public string ReferenceId { get; set; }
}
