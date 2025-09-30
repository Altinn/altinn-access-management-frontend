using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.Platform.Profile.Models;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with profile endpoints in access management component
    /// </summary>
    public interface IProfileClient
    {
        /// <summary>
        /// Gets the user's preferences from altinn profile
        /// </summary>
        /// <returns>users preferred settings</returns>
        Task<UserProfile> GetUserProfile(int userId);

        /// <summary>
        /// Gets the user's profile settings from altinn profile
        /// </summary>
        /// <returns>users profile settings</returns>
        Task<UserProfile> GetUserProfile(Guid uuid);

        /// <summary>
        /// Gets the organization's notification addresses from altinn profile
        /// </summary>
        /// <returns>A list of addresses</returns>
        Task<List<NotificationAddressResponse>> GetOrgNotificationAddresses(string orgNumber);

        /// <summary>
        /// Posts a new notification address for a given organization
        /// </summary>
        /// <returns>A list of addresses</returns>
        Task<NotificationAddressResponse> PostNewOrganisationNotificationAddress(string orgNumber, NotificationAddressModel notificationAddress);

        /// <summary>
        /// Deletes a notification address for a given organization
        /// </summary>
        /// <returns>A list of addresses</returns>
        Task<NotificationAddressResponse> DeleteOrganisationNotificationAddress(string orgNumber, int notificationAddressId);
    }
}
