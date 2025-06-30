using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// ResourceAM
    /// </summary>
    public class ResourceAM
    {
        /// <summary>
        /// Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// ProviderId
        /// </summary>
        public Guid ProviderId { get; set; }

        /// <summary>
        /// TypeId
        /// </summary>
        public Guid TypeId { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Refrence identifier
        /// </summary>
        public string RefId { get; set; }

        /// <summary>
        /// Provider
        /// </summary>
        public Provider Provider { get; set; }

        /// <summary>
        /// Type
        /// </summary>
        public AccessPackageResourceType Type { get; set; }
    }

    /// <summary>
    /// AccessPackageResourceType
    /// </summary>
    public class AccessPackageResourceType
    {
        /// <summary>
        /// Name
        /// </summary>
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResourceType Name { get; set; }
    }
}
