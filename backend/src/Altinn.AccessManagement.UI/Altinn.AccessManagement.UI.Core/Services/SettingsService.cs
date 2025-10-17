using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with platform clients to fetch and edit settings of a profile
    /// </summary>
    public class SettingsService : ISettingsService
    {
        private readonly IProfileClient _profileClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SettingsService"/> class.
        /// </summary>
        /// <param name="profileClient">profile client</param>
        public SettingsService(IProfileClient profileClient)
        {
            _profileClient = profileClient;
        }

        /// <inheritdoc/>        
        public async Task<List<NotificationAddressResponse>> GetOrganisationNotificationAddresses(string orgNumber)
        {
            return await _profileClient.GetOrgNotificationAddresses(orgNumber);
        }

        /// <inheritdoc/>
        public async Task<NotificationAddressResponse> PostNewOrganisationNotificationAddress(string orgNumber, NotificationAddressModel notificationAddress)
        {
            return await _profileClient.PostNewOrganisationNotificationAddress(orgNumber, notificationAddress);
        }

        /// <inheritdoc/>
        public async Task<NotificationAddressResponse> DeleteOrganisationNotificationAddress(string orgNumber, int notificationAddressId)
        {
            return await _profileClient.DeleteOrganisationNotificationAddress(orgNumber, notificationAddressId);
        }

        /// <inheritdoc/>
        public async Task<NotificationAddressResponse> UpdateOrganisationNotificationAddress(string orgNumber, int notificationAddressId, NotificationAddressModel notificationAddress)
        {
            return await _profileClient.UpdateOrganisationNotificationAddress(orgNumber, notificationAddressId, notificationAddress);
        }
    }
}
