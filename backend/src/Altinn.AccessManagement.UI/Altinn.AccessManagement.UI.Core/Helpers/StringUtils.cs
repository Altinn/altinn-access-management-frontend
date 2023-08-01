namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    ///     Utils for strings
    /// </summary>
    internal class StringUtils
    {
        /// <summary>
        ///     Checks if a string is not null and if it contains another given string
        /// </summary>
        /// <param name="stringToSearch"> The string that will be searched through </param>
        /// <param name="stringToFind"> The substring to search for in stringToSeach </param>
        /// <returns>true if stringToSearch is not null and contains stringToFind, otherwise false</returns>
        public static bool NotNullAndContains(string stringToSearch, string stringToFind)
        {
            if (stringToSearch == null)
            {
                return false;
            }
            else
            {
                return stringToSearch.ToLower().Contains(stringToFind);
            }
        }
    }
}
