namespace Altinn.AccessManagement.UI.Models
{
    /// <summary>
    /// Model for input when validating a person
    /// </summary>
    public class ValidatePersonInput
    {
        /// <summary>
        /// The social security number of the person to validate
        /// </summary>
        public string Ssn { get; set; }

        /// <summary>
        /// The last name of the person to validate 
        /// </summary>
        public string LastName { get; set; }
    }
}
