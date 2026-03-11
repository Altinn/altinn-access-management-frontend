namespace Altinn.AccessManagement.UI.Core.Models.Request;

/// <summary>
/// Definition of connection from one party to another
/// </summary>
public class ConnectionRequestDto
{
    /// <summary>
    /// Party that is requested to grant access
    /// </summary>
    public PartyEntityDto From { get; set; }

    /// <summary>
    /// Party that access is requested for
    /// </summary>
    public PartyEntityDto To { get; set; }
}

/// <summary>
/// Party entity reference
/// </summary>
public class PartyEntityDto
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Type of entity (e.g. organization, person, systemuser)
    /// </summary>
    public string Type { get; set; }

    /// <summary>
    /// SubType of entity (e.g. for organization: AS, ENK, DA)
    /// </summary>
    public string SubType { get; set; }
}