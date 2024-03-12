namespace Altinn.AccessManagement.UI.Core.Models.SingleRight
{
    /// <summary>
    ///     Represents a reason for why something failed.
    /// </summary>
    public class Parameters
    {
        /// <summary>
        ///     explicit information about the which roles that has access to delegate the right
        /// </summary>
        public List<IdValuePair> RoleRequirementsMatcher { get; set; }
    }
}
