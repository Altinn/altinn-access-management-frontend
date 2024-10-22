namespace Altinn.AccessManagement.UI.Core.Models.SingleRight
{
    /// <summary>
    ///     The edits to be made to the delegated right on a resource
    /// </summary>
    public class RightChanges
    {
        /// <summary>
        ///     List of rightKeys for the rights that are to be delegated
        /// </summary>
        public List<string> RightsToDelegate { get; set; }

        /// <summary>
        ///     List of rightKeys for the rights that are to be revoked
        /// </summary>
        public List<string> RightsToRevoke { get; set; }

    }
}
