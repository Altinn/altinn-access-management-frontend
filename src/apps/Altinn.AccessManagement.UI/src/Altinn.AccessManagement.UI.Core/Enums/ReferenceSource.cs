using System.Runtime.Serialization;

namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Enum for the different reference sources for resources in the resource registry
    /// </summary>
    public enum ReferenceSource
    {
        /// <summary>
        /// Default
        /// </summary>
        [EnumMember(Value = "Default")]
        Default = 0,

        /// <summary>
        /// Altinn1
        /// </summary>
        [EnumMember(Value = "Altinn1")]
        Altinn1 = 1,

        /// <summary>
        /// Altinn2
        /// </summary>
        [EnumMember(Value = "Altinn2")]
        Altinn2 = 2,

        /// <summary>
        /// Altinn3
        /// </summary>
        [EnumMember(Value = "Altinn3")]
        Altinn3 = 3,

        /// <summary>
        /// ExternalPlatform
        /// </summary>
        [EnumMember(Value = "ExternalPlatform")]
        ExternalPlatform = 4,
    }
}
