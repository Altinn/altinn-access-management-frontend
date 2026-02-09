namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Utility methods for validating person identifiers.
    /// </summary>
    public static class PersonIdentifierUtils
    {
        /// <summary>
        /// Checks whether a person identifier is a valid SSN (11 digits).
        /// </summary>
        /// <param name="personIdentifier">The person identifier.</param>
        /// <returns><c>true</c> when the identifier is exactly 11 digits.</returns>
        public static bool IsValidSsn(string personIdentifier)
        {
            return personIdentifier.Length == 11 && personIdentifier.All(char.IsDigit);
        }

        /// <summary>
        /// Checks whether a person identifier contains only digits.
        /// </summary>
        /// <param name="personIdentifier">The person identifier.</param>
        /// <returns><c>true</c> when all characters are digits.</returns>
        public static bool IsDigitsOnly(string personIdentifier)
        {
            return !string.IsNullOrEmpty(personIdentifier) && personIdentifier.All(char.IsDigit);
        }

        /// <summary>
        /// Checks whether a person identifier is a valid username.
        /// </summary>
        /// <param name="personIdentifier">The person identifier.</param>
        /// <returns><c>true</c> when the username is at least 6 characters.</returns>
        public static bool IsValidUsername(string personIdentifier)
        {
            return personIdentifier.Length >= 6;
        }

        /// <summary>
        /// Checks whether a person identifier has a valid format.
        /// Digits-only identifiers must be a valid SSN, otherwise username rules apply.
        /// </summary>
        /// <param name="personIdentifier">The person identifier.</param>
        /// <returns><c>true</c> when the format is valid.</returns>
        public static bool IsValidPersonIdentifier(string personIdentifier)
        {
            if (string.IsNullOrWhiteSpace(personIdentifier))
            {
                return false;
            }

            return IsDigitsOnly(personIdentifier)
                ? IsValidSsn(personIdentifier)
                : IsValidUsername(personIdentifier);
        }
    }
}
