namespace Altinn.AccessManagement.UI.Core.Models.Common;

/// <summary>
/// Represents a Role.
/// </summary>
public class Role
{
    /// <summary>
    /// Id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name
    /// e.g Dagligleder
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Code
    /// e.g daglig-leder
    /// </summary>
    public string Code { get; set; }

    /// <summary>
    /// Description
    /// e.g The main operator of the organization
    /// </summary>
    public string Description { get; set; }

    /// <summary>
    /// Defines the role as a KeyRole
    /// </summary>
    public bool IsKeyRole { get; set; }

    /// <summary>
    /// Urn
    /// e.g altinn:external-role:ccr:daglig-leder
    /// altinn:role:tilgangsstyrer
    /// </summary>
    public string Urn { get; set; }

    /// <summary>
    /// Legacy role code
    /// </summary>
    public string LegacyRoleCode { get; set; }

    /// <summary>
    /// Legacy Urn
    /// </summary>
    public string LegacyUrn { get; set; }

    /// <summary>
    /// Provider
    /// </summary>
    public Provider Provider { get; set; }

    /// <summary>
    /// Construct from Role
    /// </summary>
    public Role()
    {
    }
}

/// <summary>
/// Compact Role Model
/// </summary>
public class CompactRole
{
    /// <summary>
    /// Id
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Code
    /// </summary>
    public string Code { get; set; }

    /// <summary>
    /// Children
    /// </summary>
    public List<CompactRole> Children { get; set; }
}