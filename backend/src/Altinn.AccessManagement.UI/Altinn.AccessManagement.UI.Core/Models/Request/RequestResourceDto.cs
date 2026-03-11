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
}

/// <summary>
/// Resource reference
/// </summary>
public class ResourceReferenceDto
{
    /// <summary>
    /// Identifying the resource
    /// </summary>
    public string ResourceId { get; set; }
}