using Altinn.AccessManagement.UI.Core.Enums;

namespace Altinn.AccessManagement.UI.Core.Models.Request;

/// <summary>
/// Base response dto for requests
/// </summary>
public class RequestDto
{
    /// <summary>
    /// Request id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Discriminator indicating the request type: "resource", "package", or "assignment"
    /// </summary>
    public string RequestType { get; set; }

    /// <summary>
    /// Request status (e.g. draft, pending, approved, rejected, withdrawn)
    /// </summary>
    public RequestStatus Status { get; set; }

    /// <summary>
    /// Connection from one party to another that is requested
    /// </summary>
    public ConnectionRequestDto Connection { get; set; }
}