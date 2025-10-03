namespace Altinn.AccessManagement.UI.Core.Models.Profile
{
    /// <summary>
    /// Represents a notification address
    /// </summary>
    public class NotificationAddressModel
    {
        /// <summary>
        /// Country code for phone number
        /// </summary>
        public string CountryCode { get; set; }

        /// <summary>
        /// Email address
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Phone number
        /// </summary>
        public string Phone { get; set; }
    }
}
