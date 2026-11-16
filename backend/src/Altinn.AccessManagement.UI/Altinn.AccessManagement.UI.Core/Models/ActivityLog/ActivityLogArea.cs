namespace Altinn.AccessManagement.UI.Core.Models.ActivityLog
{
    /// <summary>
    /// The activity log areas served by the access management API. Each area is its own authorization
    /// boundary and serves its own slice of the log.
    /// </summary>
    public static class ActivityLogArea
    {
        /// <summary>
        /// Assignments and delegations between parties (Maskinporten schema events excluded).
        /// </summary>
        public const string Connections = "connections";

        /// <summary>
        /// Access requests, including their package and resource children and status changes.
        /// </summary>
        public const string Request = "request";

        /// <summary>
        /// Maskinporten schema delegations (the supplier role slice).
        /// </summary>
        public const string Maskinporten = "maskinporten";

        private static readonly string[] All = { Connections, Request, Maskinporten };

        /// <summary>
        /// Only known values are let through to be used in the API string.
        /// </summary>
        /// <param name="area">The value to check.</param>
        /// <returns>True when it is a known area.</returns>
        public static bool IsValid(string area)
        {
            return All.Contains(area, StringComparer.OrdinalIgnoreCase);
        }
    }
}
