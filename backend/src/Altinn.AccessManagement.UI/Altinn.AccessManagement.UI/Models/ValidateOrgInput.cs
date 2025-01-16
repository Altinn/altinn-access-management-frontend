namespace Altinn.AccessManagement.UI.Models
{
    /// <summary>
    /// Model for input when validating an organization
    /// </summary>
    public class ValidateOrgInput
    {
        /// <summary>
        /// The org number of the org to validate
        /// </summary>
        public string OrgNumber { get; set; }

        /// <summary>
        /// The name of the org to validate 
        /// </summary>
        public string OrgName { get; set; }
    }
}
