using System.Runtime.Serialization;

namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Enum for reference types of resources in the resource registry
    /// </summary>
    public enum ReferenceType : int
    {
        /// <summary>
        /// Default
        /// </summary>
        [EnumMember(Value = "Default")]
        Default = 0,

        /// <summary>
        /// Uri
        /// </summary>
        [EnumMember(Value = "Uri")]
        Uri = 1,

        /// <summary>
        /// DelegationSchemeId
        /// </summary>
        [EnumMember(Value = "DelegationSchemeId")]
        DelegationSchemeId = 2,

        /// <summary>
        /// MaskinportenScope
        /// </summary>
        [EnumMember(Value = "MaskinportenScope")]
        MaskinportenScope = 3,

        /// <summary>
        /// ServiceCode
        /// </summary>
        [EnumMember(Value = "ServiceCode")]
        ServiceCode = 4,

        /// <summary>
        /// ServiceEditionCode
        /// </summary>
        [EnumMember(Value = "ServiceEditionCode")]
        ServiceEditionCode = 5,

        /// <summary>
        /// ApplicationId
        /// </summary>
        [EnumMember(Value = "ApplicationId")]
        ApplicationId = 6,
    }
}
