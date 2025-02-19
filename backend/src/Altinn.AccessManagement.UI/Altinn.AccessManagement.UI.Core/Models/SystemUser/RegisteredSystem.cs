namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// Model for the response of a registered system
    /// A Registered System is a product supplied by a System Vendor,
    /// it may need Rights to use or acccess Resources at a Service Provider.
    /// </summary>
    public class RegisteredSystem
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
        public required IDictionary<string, string> Name { get; set; }

        /// <summary>
        /// A short description of the product, used when displaying to the user
        /// </summary>
        public required IDictionary<string, string> Description { get; set; }

        /// <summary>
        /// The array of Rights versus System Provider's Resources needed to use this Registered System
        /// </summary>
        public List<Right> Rights { get; set; } = new List<Right>();

        /// <summary>
        /// Array of access packages set for this system
        /// </summary>
        public List<RegisteredSystemAccessPackage> AccessPackages { get; set; } = new List<RegisteredSystemAccessPackage>();

        /// <summary>
        /// True if the registered system is visible to the user in the UI
        /// </summary>
        public bool IsVisible { get; set; }
    }
}