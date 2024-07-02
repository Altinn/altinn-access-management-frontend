using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    ///     Response model for the result of a api-delegation to a recipient.
    /// </summary>
    public class ApiDelegationOutput
    {
        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        public string OrgNumber { get; set; }

        /// <summary>
        /// Gets or sets the API identifier.
        /// </summary>
        public string ApiId { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the operation was successful.
        /// </summary>
        public bool Success { get; set; }
    }
}
