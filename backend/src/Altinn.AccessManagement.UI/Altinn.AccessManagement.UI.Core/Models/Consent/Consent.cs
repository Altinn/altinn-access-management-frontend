namespace Altinn.AccessManagement.UI.Core.Models.Consent
{
    /// <summary>
    /// Describes a concent
    /// </summary>
    public class Consent
    {
        /// <summary>
        /// The unique identifier for the consent.
        /// </summary>
        public required Guid Id { get; set; }

        /// <summary>
        /// The consent party 
        /// </summary>
        public required string From { get; set; }

        /// <summary>
        /// Defines the party requesting consent.
        /// </summary>
        public required string To { get; set; }

        /// <summary>
        /// Defines when the consent was given.
        /// </summary>
        public DateTimeOffset Consented { get; set; }

        /// <summary>
        /// Defines how long the concent is valid
        /// </summary>
        public DateTimeOffset ValidTo { get; set; }

        /// <summary>
        /// The consented rights.
        /// </summary>
        //public required List<ConsentRight> ConsentRights { get; set; }

        /// <summary>
        /// The consent context
        /// </summary>
        public ConsentContext Context { get; set; }
    }
}