namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Enum representation of the different types of resources supported by the resource registry
    /// </summary>
    [Flags]
    public enum ResourceType
    {
        Default = 0,

        SystemResource = 1,

        MaskinportenSchema = 2,

        Altinn2Service = 4,

        AltinnApp = 8,

        GenericAccessResource = 16,
    }
}
