namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// Represents a set of APIs given to or recieved from an organization.
    /// </summary>
    public class OrganizationApiSet
    {
        /// <summary>
        /// Gets or sets the ID of the organization.
        /// </summary>
        public string Id { get; set; }
    
        /// <summary>
        /// Gets or sets the name of the organization.
        /// </summary>
        public string Name { get; set; }
    
        /// <summary>
        /// Gets or sets the organization number.
        /// </summary>
        public string OrgNumber { get; set; }
    
        /// <summary>
        /// Gets or sets a set of APIs given to or recieved from an organization
        /// </summary>
        public List<ApiListItem> ApiList { get; set; } = new List<ApiListItem>();
    }

    /// <summary>
    /// Represents an API item.
    /// </summary>
    public class ApiListItem
    {
        /// <summary>
        /// Gets or sets the ID of the API.
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the API.
        /// </summary>
        public string ApiName { get; set; }

        /// <summary>
        /// Gets or sets the owner of the API.
        /// </summary>
        public string Owner { get; set; }

        /// <summary>
        /// Gets or sets the description of the API.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the scopes associated with the API.
        /// </summary>
        public List<string> Scopes { get; set; }
    }

    /// <summary>
    /// Represents the type of delegation.
    /// </summary>
    public enum DelegationType
    {
        /// <summary>
        /// Offered delegation type.
        /// </summary>
        Offered,

        /// <summary>
        /// Received delegation type.
        /// </summary>
        Received
    }
}