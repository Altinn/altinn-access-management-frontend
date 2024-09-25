namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// Represents a set of APIs given to or received from an organization.
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
        /// Gets or sets a set of APIs given to or received from an organization
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

    /// <summary>
    /// Provides methods to parse delegation types.
    /// </summary>
    public static class DelegationTypeParser
    {
        /// <summary>
        /// Parses a string value to a <see cref="DelegationType"/>.
        /// </summary>
        /// <param name="value">The string value to parse.</param>
        /// <returns>The parsed <see cref="DelegationType"/>.</returns>
        /// <exception cref="ArgumentException">Thrown when the value is not a valid delegation type.</exception>
        public static DelegationType Parse(string value)
        {
            return value.ToLower() switch
            {
                "offered" => DelegationType.Offered,
                "received" => DelegationType.Received,
                _ => throw new ArgumentException("Invalid delegation type", nameof(value))
            };
        }
    }
}