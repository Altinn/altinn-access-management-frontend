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

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="delegatedFrom">The id of the party delegated from</param>
        /// <param name="DelegatedTo">The id of the party delegated to</param>
        public AccessDetails(Guid delegatedFrom, Guid DelegatedTo)
        {
            DelegatedFrom = delegatedFrom;
            this.DelegatedTo = DelegatedTo;
        }

        /// <summary>
        /// Default constructor
        /// </summary>
        public AccessDetails()
        {
        }
    }
}
