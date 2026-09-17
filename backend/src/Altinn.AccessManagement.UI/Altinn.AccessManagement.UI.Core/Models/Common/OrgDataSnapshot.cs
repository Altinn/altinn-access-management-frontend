#nullable enable

namespace Altinn.AccessManagement.UI.Core.Models.Common
{
    /// <summary>
    /// How current the organization data in a snapshot is.
    /// </summary>
    public enum OrgDataAvailability
    {
        /// <summary>
        /// The data was fetched from the Altinn CDN within the cache lifetime.
        /// </summary>
        Live,

        /// <summary>
        /// The Altinn CDN could not be reached, so the last successfully fetched data is served instead.
        /// </summary>
        Stale,

        /// <summary>
        /// The Altinn CDN could not be reached and nothing has been fetched successfully yet.
        /// </summary>
        Unavailable,
    }

    /// <summary>
    /// Organization data from the Altinn CDN, along with how current it is.
    /// </summary>
    /// <remarks>
    /// Callers that only decorate a response (e.g. resolving a service owner logo) can ignore the
    /// availability and use <see cref="Data"/> directly — a missing logo is an acceptable outcome.
    /// Callers where the organization data <em>is</em> the response should check
    /// <see cref="Availability"/> and fail loudly rather than return a silently empty result.
    /// </remarks>
    public class OrgDataSnapshot
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="OrgDataSnapshot"/> class.
        /// </summary>
        /// <param name="data">The organization data, keyed by org code.</param>
        /// <param name="availability">How current the data is.</param>
        public OrgDataSnapshot(Dictionary<string, OrgData> data, OrgDataAvailability availability)
        {
            Data = data;
            Availability = availability;
        }

        /// <summary>
        /// Gets the organization data, keyed case-insensitively by org code. Never null, but empty
        /// when <see cref="Availability"/> is <see cref="OrgDataAvailability.Unavailable"/>.
        /// </summary>
        public Dictionary<string, OrgData> Data { get; }

        /// <summary>
        /// Gets how current <see cref="Data"/> is.
        /// </summary>
        public OrgDataAvailability Availability { get; }
    }
}
