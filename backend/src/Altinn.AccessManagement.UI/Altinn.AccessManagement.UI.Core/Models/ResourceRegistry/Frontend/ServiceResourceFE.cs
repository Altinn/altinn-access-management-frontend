using System.Text.Json.Serialization;
using Altinn.AccessManagement.Core.UI.Enums;

namespace Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend
{
    /// <summary>
    /// Model describing a complete resource from the resource registry.
    /// </summary>
    public class ServiceResourceFE
    {
        /// <summary>
        /// The identifier of the resource
        /// </summary>
        public string Identifier { get; set; }

        /// <summary>
        /// The title of service
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Description explaining the rights a recipient will receive if given access to the resource
        /// </summary>
        public string RightDescription { get; set; }

        /// <summary>
        /// The homepage
        /// </summary>
        public string Homepage { get; set; }

        /// <summary>
        /// The status
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// When the resource is available from
        /// </summary>
        public DateTime ValidFrom { get; set; }

        /// <summary>
        /// When the resource is available to
        /// </summary>
        public DateTime ValidTo { get; set; }

        /// <summary>
        /// Name of resource owner
        /// </summary>
        public string ResourceOwnerName { get; set; }

        /// <summary>
        /// ResourceReference
        /// </summary>
        public List<ResourceReference> ResourceReferences { get; set; }

        /// <summary>
        /// ResourceType
        /// </summary>
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResourceType ResourceType { get; set; }
    }
}
