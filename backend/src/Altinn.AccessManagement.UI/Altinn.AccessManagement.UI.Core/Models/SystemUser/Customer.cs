namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// Customer used in client delegation
    /// </summary>
    public class Customer
    {
        /// <summary>
        /// UUid of the party
        /// </summary>
        public required Guid PartyUuid { get; set; }
        
        /// <summary>
        /// Display name of the party
        /// </summary>
        public required string DisplayName { get; set; }

        /// <summary>
        /// Organisation number
        /// </summary>
        public required string OrganizationIdentifier { get; set; }

        /// <summary>
        /// Gets or sets a collection of all access information for the client 
        /// </summary>
        public List<ClientRoleAccessPackages> Access { get; set; } = [];
    }
}