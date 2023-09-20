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
        /// spatial coverage
        /// This property represents that area(s) a Public Service is likely to be available only within, typically the area(s) covered by a particular public authority.
        /// </summary>
        public List<string>? Spatial { get; set; }

        /// <summary>
        /// List of possible contact points
        /// </summary>
        public List<ContactPoint> ContactPoints { get; set; }

        /// <summary>
        /// Is this resource possible to delegate to others or not
        /// </summary>
        public bool Delegable { get; set; } = true;

        /// <summary>
        /// The visibility of the resource
        /// </summary>
        public bool Visible { get; set; } = true;

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
        public ServiceResourceFE(string identifier, string title, string description, string rightDescription, string status, string resourceOwnerName, string resourceOwnerOrgNumber, List<ResourceReference> resourceReferences, ResourceType resourceType, List<ContactPoint> contactPoints, List<string> spatial, string? homepage = null, int? priorityCounter = null, bool visible = true, bool delegable = true)
        {
            Identifier = identifier;
            Title = title;
            Description = description;
            RightDescription = rightDescription;
            Homepage = homepage;
            Status = status;
            ResourceOwnerName = resourceOwnerName;
            ResourceOwnerOrgNumber = resourceOwnerOrgNumber;
            ResourceReferences = resourceReferences;
            PriorityCounter = priorityCounter;
            ResourceType = resourceType;
            Visible = visible;
            Delegable = delegable;
            ContactPoints = contactPoints;
            Spatial = spatial;
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
            ResourceOwnerName = serviceResourceFE.ResourceOwnerName;
            ResourceOwnerOrgNumber = serviceResourceFE.ResourceOwnerOrgNumber;
            PriorityCounter = serviceResourceFE.PriorityCounter;
            ResourceReferences = serviceResourceFE.ResourceReferences;
            ResourceType = serviceResourceFE.ResourceType;
            Visible = serviceResourceFE.Visible;
            Delegable = serviceResourceFE.Delegable;
            ContactPoints = serviceResourceFE.ContactPoints;
            Spatial = serviceResourceFE.Spatial;
        }
    }
}
