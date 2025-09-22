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
    }
}
