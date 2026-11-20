using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate.Frontend
{
    /// <summary>
    /// A bankruptcy estate administrator, as sent to the frontend
    /// </summary>
    public class BankruptcyEstateAdministratorFE
    {
        /// <summary>
        /// Gets or sets the person holding the administrator role
        /// </summary>
        public PartyFE Administrator { get; set; }

        /// <summary>
        /// Gets or sets the administrator role
        /// </summary>
        public CompactRole AdminRole { get; set; }

        /// <summary>
        /// Gets or sets when the administrator was added
        /// </summary>
        public DateTimeOffset AdminAddedAt { get; set; }

        /// <summary>
        /// Maps an administrator from the access management bankruptcy estate endpoints
        /// </summary>
        public static BankruptcyEstateAdministratorFE FromAdministrator(BankruptcyEstateAdministrator administrator)
        {
            if (administrator == null)
            {
                return null;
            }

            return new BankruptcyEstateAdministratorFE
            {
                Administrator = PartyFE.FromEntity(administrator.Administrator),
                AdminRole = administrator.AdminRole,
                AdminAddedAt = administrator.AdminAddedAt,
            };
        }
    }
}
