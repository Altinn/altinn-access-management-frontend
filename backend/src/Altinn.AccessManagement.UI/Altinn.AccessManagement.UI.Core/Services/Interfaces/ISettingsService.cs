using Altinn.AccessManagement.UI.Core.Models.Profile;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for fetching and changing the settings of a given profile
    /// </summary>
    public interface ISettingsService
    {
        /// <summary>
        /// Gets the notification addresses for an organization based on the organization number
        /// </summary>
        /// <param name="orgNumber">The organization number</param>
        /// <returns>
        /// List of notification addresses
        /// </returns>
        Task<List<NotificationAddressResponse>> GetOrganisationNotificationAddresses(string orgNumber);

        /// <summary>
        /// Posts a new notification address for a given organization
        /// </summary>
        /// <param name="orgNumber">The organization number</param>
        /// <param name="notificationAddress">The new address to be added</param>
        /// <returns>
        /// List of notification addresses
        /// </returns>
        Task<NotificationAddressResponse> PostNewOrganisationNotificationAddress(string orgNumber, NotificationAddressModel notificationAddress);

        /// <summary>
        /// Deletes a notification address for a given organization
        /// </summary>
        /// <param name="orgNumber">The organization number</param>
        /// <param name="notificationAddressId">The id of the address to be deleted</param>
        /// <returns>
        /// List of notification addresses
        /// </returns>
        Task<NotificationAddressResponse> DeleteOrganisationNotificationAddress(string orgNumber, int notificationAddressId);
    }
}
