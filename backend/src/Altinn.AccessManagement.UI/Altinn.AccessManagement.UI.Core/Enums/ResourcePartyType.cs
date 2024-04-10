using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Defines the type of party that a resource is targeting
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ResourcePartyType
    {
        /// <summary>
        /// PrivatePerson.
        /// </summary>
        [EnumMember(Value = "PrivatePerson")]
        PrivatePerson = 0,

        /// <summary>
        /// LegalEntityEnterprise.
        /// </summary>
        [EnumMember(Value = "LegalEntityEnterprise")]
        LegalEntityEnterprise = 1,

        /// <summary>
        /// Company.
        /// </summary>
        [EnumMember(Value = "Company")]
        Company = 2,

        /// <summary>
        /// BankruptcyEstate.
        /// </summary>
        [EnumMember(Value = "BankruptcyEstate")]
        BankruptcyEstate = 3,

        /// <summary>
        /// SelfRegisteredUser.
        /// </summary>
        [EnumMember(Value = "SelfRegisteredUser")]
        SelfRegisteredUser = 4,
    }
}
