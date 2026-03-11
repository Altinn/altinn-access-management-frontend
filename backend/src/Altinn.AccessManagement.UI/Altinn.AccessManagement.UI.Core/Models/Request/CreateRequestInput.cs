namespace Altinn.AccessManagement.UI.Core.Models.Request;

/// <summary>
/// Base input dto for creating a new request
/// </summary>
public class CreateRequestInput
{
    /// <summary>
    /// Request connection
    /// </summary>
    public ConnectionRequestInputDto Connection { get; set; }

    /// <summary>
    /// Reference to the resource
    /// </summary>
    public ResourceReferenceDto Resource { get; set; }
}

/// <summary>
/// Input for creating a new request
/// </summary>
public class ConnectionRequestInputDto
{
    /// <summary>
    /// Urn describing the party
    /// </summary>
    public string From { get; set; }

    /// <summary>
    /// Urn describing the party
    /// </summary>
    public string To { get; set; }
}