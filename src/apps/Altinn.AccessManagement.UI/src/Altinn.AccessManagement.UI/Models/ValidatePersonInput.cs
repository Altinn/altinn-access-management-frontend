namespace Altinn.AccessManagement.UI.Models
{
    /// <summary>
    /// Model for input when validating a person
    /// </summary>
    public class ValidatePersonInput
    {
        /// <summary>
        /// The person identifier (social security number or username) of the person to validate
        /// </summary>
        public string PersonIdentifier { get; set; }

        /// <summary>
        /// The last name of the person to validate 
        /// </summary>
        public string LastName { get; set; }
    }
}
