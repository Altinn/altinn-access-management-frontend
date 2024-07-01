using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    ///     Model for performing a delegation of one or more rights to one or more recipients.
    /// </summary>
    public class ApiDelegationInput
    {
        /// <summary>
        /// Gets or sets the list of organization numbers. This field is required.
        /// </summary>
        public List<string> OrgNumbers { get; set; }

        /// <summary>
        /// Gets or sets the list of API identifiers. This field is required.
        /// </summary>
        public List<string> ApiIdentifiers { get; set; }
    }
}