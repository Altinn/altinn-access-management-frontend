using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.User // Or a more general namespace if you prefer
{
    /// <summary>
    /// A custom <see cref="JsonConverter"/> for <see cref="Dictionary{TKey, TValue}"/> where TKey and TValue are strings.
    /// This converter ensures that only a predefined set of keys are accepted during JSON deserialization,
    /// ignoring any other key-value pairs present in the JSON object.
    /// </summary>
    public class AllowedKeysDictionaryConverter : JsonConverter<Dictionary<string, string>>
    {
        private readonly ISet<string> _allowedKeys;

        /// <summary>
        /// Initializes a new instance of the <see cref="AllowedKeysDictionaryConverter"/> class.
        /// The allowed keys are hardcoded to "OrganizationIdentifier", "DateOfBirth" and "PartyId".
        /// </summary>
        public AllowedKeysDictionaryConverter()
        {
            _allowedKeys = new HashSet<string>
            {
                "OrganizationIdentifier",
                "PartyId",
                "DateOfBirth"
            };
        }

        /// <summary>
        /// Reads and converts the JSON to a <see cref="Dictionary{TKey, TValue}"/>.
        /// Only key-value pairs where the key is in the allowed set are added to the dictionary.
        /// </summary>
        /// <param name="reader">The <see cref="Utf8JsonReader"/> to read from.</param>
        /// <param name="typeToConvert">The type to convert.</param>
        /// <param name="options">The <see cref="JsonSerializerOptions"/> to use.</param>
        /// <returns>A new dictionary containing only the allowed key-value pairs.</returns>
        public override Dictionary<string, string> Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options)
        {
            if (reader.TokenType != JsonTokenType.StartObject)
            {
                throw new JsonException("Expected StartObject token for dictionary.");
            }

            var dictionary = new Dictionary<string, string>();

            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject)
                {
                    return dictionary;
                }

                if (reader.TokenType != JsonTokenType.PropertyName)
                {
                    throw new JsonException("Expected PropertyName token in dictionary.");
                }

                string propertyName = reader.GetString();
                reader.Read();

                if (_allowedKeys.Contains(propertyName))
                {
                    if (reader.TokenType == JsonTokenType.String)
                    {
                        dictionary[propertyName] = reader.GetString();
                    }
                    else
                    {
                        reader.Skip();
                    }
                }
                else
                {
                    reader.Skip();
                }
            }

            throw new JsonException("Unexpected end of JSON when reading dictionary.");
        }

        /// <summary>
        /// Writes a <see cref="Dictionary{TKey, TValue}"/> to JSON.
        /// </summary>
        /// <param name="writer">The <see cref="Utf8JsonWriter"/> to write to.</param>
        /// <param name="value">The dictionary to write.</param>
        /// <param name="options">The <see cref="JsonSerializerOptions"/> to use.</param>
        public override void Write(
            Utf8JsonWriter writer,
            Dictionary<string, string> value,
            JsonSerializerOptions options)
        {
            JsonSerializer.Serialize(writer, value, options);
        }
    }
}