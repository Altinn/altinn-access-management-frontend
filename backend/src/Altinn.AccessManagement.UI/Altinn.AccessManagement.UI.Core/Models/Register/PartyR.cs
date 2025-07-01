using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using System.Text.Json.Serialization;
using Altinn.Authorization.ModelUtils;
using Altinn.Platform.Register.Enums;
using Altinn.Platform.Register.Models;
using CommunityToolkit.Diagnostics;

namespace Altinn.Platform.Models.Register;

/// <summary>
/// Represents a party in Altinn Register.
/// </summary>
public record PartyR
{
    [JsonExtensionData]
    private readonly JsonElement _extensionData;

    private readonly Guid _uuid;

    /// <summary>
    /// Gets the UUID of the party.
    /// </summary>
    [JsonPropertyName("partyUuid")]
    public required Guid Uuid
    {
        get => _uuid;
        init
        {
            Guard.IsNotDefault(value);
            _uuid = value;
        }
    }

    /// <summary>
    /// Gets the version ID of the party.
    /// </summary>
    [JsonPropertyName("versionId")]
    public required ulong VersionId { get; init; }

    /// <summary>
    /// Gets the ID of the party.
    /// </summary>
    [JsonPropertyName("partyId")]
    public required uint PartyId { get; init; }

    /// <summary>
    /// Gets the type of the party.
    /// </summary>
    [JsonPropertyName("partyType")]
    [PolymorphicDiscriminatorProperty]
    public required NonExhaustiveEnum<PartyType> Type { get; init; }

    /// <summary>
    /// Gets the display-name of the party.
    /// </summary>
    [JsonPropertyName("displayName")]
    public required string DisplayName { get; init; }

    /// <summary>
    /// Gets when the party was created in Altinn 3.
    /// </summary>
    [JsonPropertyName("createdAt")]
    public required DateTimeOffset CreatedAt { get; init; }

    /// <summary>
    /// Gets when the party was last modified in Altinn 3.
    /// </summary>
    [JsonPropertyName("modifiedAt")]
    public required DateTimeOffset ModifiedAt { get; init; }

    /// <summary>
    /// Gets whether the party is deleted.
    /// </summary>
    [JsonPropertyName("isDeleted")]
    public required bool IsDeleted { get; init; }

    /// <summary>
    /// The organization identifier of the party, if the party is an organization.
    /// </summary>
    [JsonPropertyName("organizationIdentifier")]
    public string OrganizationIdentifier { get; init; }

    /// <summary>
    /// The date of death of the person, if the party is a person.
    /// </summary>
    [JsonPropertyName("personDateOfBirth")]
    public string PersonDateOfBirth { get; init; }

    /// <summary>
    /// The organization unit type, if the party is an organization.
    /// </summary>
    [JsonPropertyName("unitType")]
    public string UnitType { get; init; }
}