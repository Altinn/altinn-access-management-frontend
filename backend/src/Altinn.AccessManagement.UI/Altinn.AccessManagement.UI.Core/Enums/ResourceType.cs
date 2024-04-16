namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Enum representation of the different types of resources supported by the resource registry. The specific values represents their binary value.
    /// </summary>
    [Flags]
    public enum ResourceType
    {
        /// <summary>
        /// Default
        /// </summary>
        Default = 0,

        /// <summary>
        /// SystemResource
        /// </summary>
        SystemResource = 1,

        /// <summary>
        /// MaskinportenSchema
        /// </summary>
        MaskinportenSchema = 2,

        /// <summary>
        /// Altinn2Service
        /// </summary>
        Altinn2Service = 4,

        /// <summary>
        /// AltinnApp
        /// </summary>
        AltinnApp = 8,

        /// <summary>
        /// GenericAccessResource
        /// </summary>
        GenericAccessResource = 16,
    }
}
