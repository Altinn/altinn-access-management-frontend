namespace Altinn.AccessManagement.UI.Core.Models.Profile
{
    /// <summary>
    /// Represents a on organization with  notification addresses
    /// </summary>
    public class OrganizationResponse
    {
        /// <summary>
        /// The organizations organization number
        /// </summary>
        public string OrganizationNumber { get; set; }

        /// <summary>
        /// Represents a list of mandatory notification address
        /// </summary>
        public List<NotificationAddressResponse> NotificationAddresses { get; set; }
    }
}
