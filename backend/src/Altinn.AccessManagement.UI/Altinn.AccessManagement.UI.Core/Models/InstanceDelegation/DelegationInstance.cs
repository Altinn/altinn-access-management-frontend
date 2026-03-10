using Altinn.AccessManagement.UI.Core.Models.Common;

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
        public IdNamePair<Guid> Type { get; set; }
    }
}
