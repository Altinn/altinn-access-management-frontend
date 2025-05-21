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
        Default = 0,

        /// <summary>
        /// System resource type
        /// </summary>
        Systemresource = 1 << 0,

        /// <summary>
        /// Maskinporten schema resource type
        /// </summary>
        MaskinportenSchema = 1 << 1,

        /// <summary>
        /// Altinn 2 service resource type
        /// </summary>
        Altinn2Service = 1 << 2,

        /// <summary>
        /// Altinn app resource type
        /// </summary>
        AltinnApp = 1 << 3,

        /// <summary>
        /// Generic access resource type
        /// </summary>
        GenericAccessResource = 1 << 4,

        /// <summary>
        /// Broker service resource type
        /// </summary>
        BrokerService = 1 << 5,

        /// <summary>
        /// Correspondence service resource type
        /// </summary>
        CorrespondenceService = 1 << 6,

        /// <summary>
        /// Consent resource type
        /// </summary>
        ConsentResource = 1 << 7,
    }
}
