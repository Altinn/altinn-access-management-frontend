using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// The kind of party, as sent to the frontend. Serialized as a string.
    /// Subunits are <see cref="Organization"/> with a subunit unit type.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PartyTypeFE
    {
        /// <summary>
        /// A person
        /// </summary>
        Person,

        /// <summary>
        /// An organization, including subunits
        /// </summary>
        Organization,

        /// <summary>
        /// A system user
        /// </summary>
        SystemUser,

        /// <summary>
        /// A self-identified user
        /// </summary>
        SelfIdentified,
    }
}
