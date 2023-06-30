using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Enums;

namespace Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend
{
    /// <summary>
    /// Model describing a complete resource from the resource registry with an added priority used for sorting.
    /// </summary>
    public class SortableServiceResourceFE
    {
        /// <summary>
        /// The  resource
        /// </summary>
        public ServiceResourceFE Resource { get; set; }

        /// <summary>
        /// Number value denoting the sorting priority of the resource. The higher the number, the higher the priority
        /// </summary>
        public int PriorityCounter { get; set; }

        /// <summary>
        /// Model describing a complete resource from the resource registry with an added priority used for sorting.
        /// </summary>
        /// <param name="resource"> The resource</param>
        /// <param name="priorityCounter"> Number value denoting the sorting priority of the resource. The higher the number, the higher the priority </param>
        public SortableServiceResourceFE(ServiceResourceFE resource, int priorityCounter)
        {
            Resource = resource;
            PriorityCounter = priorityCounter;
        }
    }
}
