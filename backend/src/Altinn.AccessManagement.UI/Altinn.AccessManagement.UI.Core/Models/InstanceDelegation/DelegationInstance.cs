namespace Altinn.AccessManagement.UI.Core.Models.InstanceDelegation
{
    /// <summary>
    /// Represents a delegated instance.
    /// </summary>
    public class DelegationInstance
    {
        /// <summary>
        /// Gets or sets the instance identifier.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the instance urn.
        /// </summary>
        public string Urn { get; set; }

        /// <summary>
        /// Gets or sets the instance type.
        /// </summary>
        public DelegationInstanceType Type { get; set; }
    }

    /// <summary>
    /// Represents the type of a delegated instance.
    /// </summary>
    public class DelegationInstanceType
    {
        /// <summary>
        /// Gets or sets the type identifier.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the type name.
        /// </summary>
        public string Name { get; set; }
    }
}
