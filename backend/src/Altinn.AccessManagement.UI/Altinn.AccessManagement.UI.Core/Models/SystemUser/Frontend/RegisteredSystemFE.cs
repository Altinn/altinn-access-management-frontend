namespace Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend
{
    /// <summary>
    /// Model for the response of a registered system
    /// A Registered System is a product supplied by a System Vendor,
    /// it may need Rights to use or acccess Resources at a Service Provider.
    /// </summary>
    public class RegisteredSystemFE
    {
        /// <summary>
        /// A unique External Id for this System, in human-readable string format.    
        /// </summary>
        public required string SystemId { get; set; } = string.Empty;

        /// <summary>
        /// Organization number of the system Vendor that offers the product (system)
        /// </summary>
        public required string SystemVendorOrgNumber { get; set; }

        /// <summary>
        /// Organization number of the system Vendor that offers the product (system)
        /// </summary>
        public string SystemVendorOrgName { get; set; } = string.Empty;

        /// <summary>
        /// A short name of the product, used when displaying to the user
        /// </summary>
        public string Name { get; set; } = string.Empty;
    }
}