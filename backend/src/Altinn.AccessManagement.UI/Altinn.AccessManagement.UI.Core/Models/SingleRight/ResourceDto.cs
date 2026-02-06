using Altinn.AccessManagement.UI.Core.Models.Common;

#nullable enable

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Extended Resource
/// </summary>
public class ResourceDto
{
    /// <summary>
    /// Id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ProviderId
    /// </summary>
    public Guid ProviderId { get; set; }

    /// <summary>
    /// TypeId
    /// </summary>
    public Guid TypeId { get; set; }

    /// <summary>
    /// Name
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Description
    /// </summary>
    public required string Description { get; set; }

    /// <summary>
    /// Reference identifier
    /// </summary>
    public required string RefId { get; set; }

    /// <summary>
    /// Provider
    /// </summary>
    public required Entity Provider { get; set; }
}

#nullable disable