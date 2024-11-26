namespace Altinn.AccessManagement.UI.Core.Models.AccessManagement
{
    /// <summary>
    /// Metadata pertaining a cetain access delegation
    /// </summary>
    public class AccessDetails
    {
        /// <summary>
        /// The party from which the access was given
        /// </summary>
        public Guid DelegatedFrom { get; set; }

        /// <summary>
        /// The recipient of the access
        /// </summary>
        public Guid DelegatedTo { get; set; }

        /// <summary>
        /// The date and time of the last change in the access
        /// </summary>
        public DateTime LastChangedOn { get; set; }

        // Alternative: AccessThrough (direktedelegering, arv, etc..)
    }
}
