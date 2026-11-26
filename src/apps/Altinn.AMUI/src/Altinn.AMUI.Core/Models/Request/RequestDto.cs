using Altinn.AMUI.Core.Enums;
using Altinn.AMUI.Core.Models.User;

namespace Altinn.AMUI.Core.Models.Request;

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
    /// Discriminator indicating the request type: "resource", "package"
    /// </summary>
    public string Type { get; set; }

    /// <summary>
    /// Request status (e.g. draft, pending, approved, rejected, withdrawn)
    /// </summary>
    public RequestStatus Status { get; set; }

    /// <summary>
    /// Party that is requested to grant access
    /// </summary>
    public Entity From { get; set; }

    /// <summary>
    /// Party that access is requested for
    /// </summary>
    public Entity To { get; set; }

    /// <summary>
    /// Last updated
    /// </summary>
    public DateTimeOffset LastUpdated { get; set; }

    /// <summary>
    /// Last updated by
    /// </summary>
    public PartyReferenceDto LastUpdatedBy { get; set; }
}

/// <summary>
/// Party reference dto
/// </summary>
public class PartyReferenceDto
{
    /// <summary>
    /// Party id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name
    /// </summary>
    public string Name { get; set; }
}