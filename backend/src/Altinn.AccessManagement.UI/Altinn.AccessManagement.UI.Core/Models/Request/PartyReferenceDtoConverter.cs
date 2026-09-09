using System.Text.Json;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.Request;

/// <summary>
/// Reads <see cref="PartyReferenceDto"/> from both the current shape
/// (<c>"lastUpdatedBy": { "id": "...", "name": "..." }</c>) and the legacy shape where the party was
/// serialized as a bare uuid string (<c>"lastUpdatedBy": "05bbad70-90db-4900-8f29-0a09cf6db1af"</c>).
///
/// TEMPORARY: exists only so this BFF can be deployed independently of the access management API
/// while that API rolls out the object shape. Requests in the legacy shape carry no name, so they are
/// read with Name left null. Remove once the object shape is live in all environments.
/// </summary>
public class PartyReferenceDtoConverter : JsonConverter<PartyReferenceDto>
{
    /// <inheritdoc />
    public override PartyReferenceDto Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        switch (reader.TokenType)
        {
            // legacy shape: the party was just its uuid
            case JsonTokenType.String:
                return reader.TryGetGuid(out Guid id) ? new PartyReferenceDto { Id = id } : null;

            case JsonTokenType.StartObject:
                return ReadObject(ref reader);

            case JsonTokenType.Null:
                return null;

            default:
                throw new JsonException($"Unexpected token '{reader.TokenType}' when reading {nameof(PartyReferenceDto)}");
        }
    }

    /// <inheritdoc />
    public override void Write(Utf8JsonWriter writer, PartyReferenceDto value, JsonSerializerOptions options)
    {
        if (value == null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();
        writer.WriteString(ConvertName(nameof(PartyReferenceDto.Id), options), value.Id);
        writer.WritePropertyName(ConvertName(nameof(PartyReferenceDto.Name), options));
        writer.WriteStringValue(value.Name);
        writer.WriteEndObject();
    }

    // read the object shape by hand: deserializing PartyReferenceDto here would re-enter this converter
    private static PartyReferenceDto ReadObject(ref Utf8JsonReader reader)
    {
        PartyReferenceDto party = new PartyReferenceDto();

        while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
        {
            string propertyName = reader.GetString();
            reader.Read();

            if (string.Equals(propertyName, nameof(PartyReferenceDto.Id), StringComparison.OrdinalIgnoreCase))
            {
                party.Id = reader.TokenType == JsonTokenType.Null ? Guid.Empty : reader.GetGuid();
            }
            else if (string.Equals(propertyName, nameof(PartyReferenceDto.Name), StringComparison.OrdinalIgnoreCase))
            {
                party.Name = reader.TokenType == JsonTokenType.Null ? null : reader.GetString();
            }
            else
            {
                reader.Skip();
            }
        }

        return party;
    }

    private static string ConvertName(string name, JsonSerializerOptions options)
    {
        return options.PropertyNamingPolicy?.ConvertName(name) ?? name;
    }
}
