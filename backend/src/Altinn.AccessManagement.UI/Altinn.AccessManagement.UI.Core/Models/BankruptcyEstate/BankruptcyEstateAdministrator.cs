using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate
{
    /// <summary>
    /// An administrator of the bankruptcy estates of a bostyrer, as returned by the access management API
    /// </summary>
    public class BankruptcyEstateAdministrator
    {
        /// <summary>
        /// Gets or sets the entity holding the bankruptcy administration role
        /// </summary>
        public Entity Administrator { get; set; } = new();

        /// <summary>
        /// Gets or sets the bankruptcy administrator role
        /// </summary>
        public CompactRole AdminRole { get; set; } = new();

        /// <summary>
        /// Gets or sets when the user was assigned the administrator role
        /// </summary>
        public DateTimeOffset AdminAddedAt { get; set; }
    }
}
