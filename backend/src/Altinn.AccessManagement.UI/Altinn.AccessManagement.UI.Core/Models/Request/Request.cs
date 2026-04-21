namespace Altinn.AccessManagement.UI.Core.Models.Request;

/// <summary>
/// Response dto for a resource request
/// </summary>
public class Request : RequestDto
{
    /// <summary>
    /// Resource that is requested
    /// </summary>
    public RequestReferenceDto Resource { get; set; }

    /// <summary>
    /// Requested package
    /// </summary>
    public RequestReferenceDto Package { get; set; }
}

/// <summary>
/// Resource reference
/// </summary>
public class RequestReferenceDto
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Identifying the resource
    /// </summary>
    public string ReferenceId { get; set; }
}
