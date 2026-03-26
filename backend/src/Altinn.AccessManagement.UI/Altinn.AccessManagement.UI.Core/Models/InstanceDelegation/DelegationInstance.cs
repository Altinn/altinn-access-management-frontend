using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Models.InstanceDelegation
{
    /// <summary>
    /// Represents a delegated instance.
    /// </summary>
    public class DelegationInstance
    {
        /// <summary>
        /// Gets or sets the instance reference ID.
        /// </summary>
        public string RefId { get; set; }

        /// <summary>
        /// Gets or sets the instance type.
        /// </summary>
        public IdNamePair<Guid> Type { get; set; }
    }
}
