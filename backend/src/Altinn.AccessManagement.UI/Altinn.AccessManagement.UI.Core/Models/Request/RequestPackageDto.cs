namespace Altinn.AccessManagement.UI.Core.Models.Request;

/// <summary>
/// Response dto for a package request
/// </summary>
public class RequestPackageDto : RequestDto
{
    /// <summary>
    /// Package that is requested
    /// </summary>
    public PackageReferenceDto Package { get; set; }
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
