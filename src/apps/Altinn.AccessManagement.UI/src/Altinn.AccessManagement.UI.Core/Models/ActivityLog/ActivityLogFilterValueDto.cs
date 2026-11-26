namespace Altinn.AccessManagement.UI.Core.Models.ActivityLog
{
    /// <summary>
    /// A value occurring in the party's slice of the activity log for one filter field.
    /// </summary>
    public class ActivityLogFilterValueDto
    {
        /// <summary>
        /// Gets or sets the id of the value.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the value, as it was when the event happened.
        /// </summary>
        public string Name { get; set; }
    }
}
