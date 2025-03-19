using NpgsqlTypes;

namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Enum representation of the different types of resources supported by the resource registry
    /// </summary>
    public enum ResourceType
    {
        /// <summary>
        /// Default resource type
        /// </summary>
        [PgName("default")]
        Default = 0,

        /// <summary>
        /// System resource type
        /// </summary>
        [PgName("systemresource")]
        Systemresource = 1 << 0,

        /// <summary>
        /// Maskinporten schema resource type
        /// </summary>
        [PgName("maskinportenschema")]
        MaskinportenSchema = 1 << 1,

        /// <summary>
        /// Altinn 2 service resource type
        /// </summary>
        [PgName("altinn2service")]
        Altinn2Service = 1 << 2,

        /// <summary>
        /// Altinn app resource type
        /// </summary>
        [PgName("altinnapp")]
        AltinnApp = 1 << 3,

        /// <summary>
        /// Generic access resource type
        /// </summary>
        [PgName("genericaccessresource")]
        GenericAccessResource = 1 << 4,

        /// <summary>
        /// Broker service resource type
        /// </summary>
        [PgName("brokerservice")]
        BrokerService = 1 << 5,

        /// <summary>
        /// Correspondence service resource type
        /// </summary>
        [PgName("correspondenceservice")]
        CorrespondenceService = 1 << 6,
    }
}
