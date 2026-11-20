namespace Altinn.AccessManagement.UI.Core.Models.ActivityLog
{
    /// <summary>
    /// An activity type catalog entry, with name and description in the requested language.
    /// </summary>
    public class ActivityTypeDto
    {
        /// <summary>
        /// Gets or sets the id of the catalog entry.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the record type: Assignment, Delegation or Request.
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets the child record category, or null for main record events.
        /// </summary>
        public string Subtype { get; set; }

        /// <summary>
        /// Gets or sets what happened: Created, Updated or Deleted.
        /// </summary>
        public string Trigger { get; set; }

        /// <summary>
        /// Gets or sets the request status, or null when the entry matches any status.
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Gets or sets the translated name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the translated description.
        /// </summary>
        public string Description { get; set; }
    }
}
