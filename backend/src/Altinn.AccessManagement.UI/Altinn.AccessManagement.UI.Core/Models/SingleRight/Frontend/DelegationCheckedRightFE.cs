namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.Frontend
{
    /// <summary>
    /// A right that that has been checked if it can be delegated or not on behalf of a given party. Simplified for GUI usage
    /// </summary>
    public class DelegationCheckedRightFE
    {
        /// <summary>
        ///     The key for the right.
        /// </summary>
        public string RightKey { get; set; }

        /// <summary>
        ///     The action performed.
        /// </summary>
        public string Action { get; set; }

        /// <summary>
        ///     Whether or not the right has been deemed delegable
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        ///     Codes that denote the reason behind the rights deemed status
        /// </summary>
        public List<string> ReasonCodes { get; set; }
    }
}
