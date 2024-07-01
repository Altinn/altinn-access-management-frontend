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

        /// <summary>
        /// Gets or sets the message associated with the operation result.
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="ApiDelegationOutput"/> class.
        /// </summary>
        /// <param name="delegationOutput">The delegation output.</param>
        public ApiDelegationOutput(DelegationOutput delegationOutput)
        {
            OrgNumber = delegationOutput.To[0].Value;
            ApiId = delegationOutput.RightDelegationResults[0].Resource[0].Value;
            Success = delegationOutput.RightDelegationResults[0].Status == "Delegated";
            Message = delegationOutput.RightDelegationResults[0].Status;
        }
    }
}
