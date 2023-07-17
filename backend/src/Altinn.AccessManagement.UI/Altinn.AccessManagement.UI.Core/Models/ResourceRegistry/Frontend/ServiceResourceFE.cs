using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Enums;

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
        public string? Homepage { get; set; }

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
        /// Org number of the resource owner
        /// </summary>
        public string ResourceOwnerOrgNumber { get; set; }

        /// <summary>
        /// ResourceReference
        /// </summary>
        public List<ResourceReference> ResourceReferences { get; set; }

        /// <summary>
        /// Counter that denotes the priority of which the resource is to be sorted (if appliccable)
        /// </summary>
        public int? PriorityCounter { get; set; }

        /// <summary>
        /// ResourceType
        /// </summary>
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResourceType ResourceType { get; set; }

        /// <summary>
        /// Parameterless constructor
        /// </summary>
        public ServiceResourceFE()
        {
        }

        /// <summary>
        /// Basic constructor
        /// </summary>
        public ServiceResourceFE(string identifier, string title, string description, string rightDescription, string status, DateTime validFrom, DateTime validTo, string resourceOwnerName, string resourceOwnerOrgNumber, List<ResourceReference> resourceReferences, ResourceType resourceType, string? homepage = null, int? priorityCounter = null)
        {
            Identifier = identifier;
            Title = title;
            Description = description;
            RightDescription = rightDescription;
            Homepage = homepage;
            Status = status;
            ValidFrom = validFrom;
            ValidTo = validTo;
            ResourceOwnerName = resourceOwnerName;
            ResourceOwnerOrgNumber = resourceOwnerOrgNumber;
            ResourceReferences = resourceReferences;
            PriorityCounter = priorityCounter;
            ResourceType = resourceType;
        }

        /// <summary>
        /// Constructor used when copying
        /// </summary>
        /// <param name="serviceResourceFE">The resource to be copied</param>
        public ServiceResourceFE(ServiceResourceFE serviceResourceFE)
        {
            Identifier = serviceResourceFE.Identifier;
            Title = serviceResourceFE.Title;
            Description = serviceResourceFE.Description;
            RightDescription = serviceResourceFE.RightDescription;
            Homepage = serviceResourceFE.Homepage;
            Status = serviceResourceFE.Status;
            ValidFrom = serviceResourceFE.ValidFrom;
            ValidTo = serviceResourceFE.ValidTo;
            ResourceOwnerName = serviceResourceFE.ResourceOwnerName;
            ResourceOwnerOrgNumber = serviceResourceFE.ResourceOwnerOrgNumber;
            PriorityCounter = serviceResourceFE.PriorityCounter;
            ResourceReferences = serviceResourceFE.ResourceReferences;
            ResourceType = serviceResourceFE.ResourceType;
        }
    }
}
