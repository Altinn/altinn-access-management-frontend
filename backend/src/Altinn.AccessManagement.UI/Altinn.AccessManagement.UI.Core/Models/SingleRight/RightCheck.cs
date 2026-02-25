using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Enums;

#nullable enable

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight;

/// <summary>
/// Action
/// </summary>
public class RightCheck
{
    /// <summary>
    /// The right, defined by its action and key
    /// </summary>
    public required Right Right
    {
        get; set;
    }

    /// <summary>
    /// Result of the delegation check.
    /// True if the user is authorized to give others access to the resource on behalf of the specified party, false otherwise.
    /// </summary>
    public required bool Result { get; set; }

    /// <summary>
    /// Reason codes indicating the type of delegation check result.
    /// </summary>
    [JsonPropertyName("reasonCodes")]
    public required List<DelegationCheckReasonCode> ReasonCodes { get; set; }
}

/// <summary>
/// A delegable right that contains an action and key
/// </summary>
public class Right
{
    /// <summary>
    /// The identifying key of the right.
    /// </summary>
    public required string Key { get; set; }

    /// <summary>
    /// The display name of the right, used for showing to users in the UI.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// The resource identifiers that the right applies to.
    /// </summary>
    public List<string>? Resource { get; set; }

    /// <summary>
    /// The action that the right applies to, e.g. "read", "write", "sign", etc.
    /// </summary>
    public required string Action { get; set; }
}

#nullable disable