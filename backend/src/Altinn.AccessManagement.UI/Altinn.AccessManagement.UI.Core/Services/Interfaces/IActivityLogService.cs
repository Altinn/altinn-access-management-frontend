using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for the activity log.
    /// </summary>
    public interface IActivityLogService
    {
        /// <summary>
        /// Gets a page of the area's log entries for the party, newest first.
        /// </summary>
        /// <param name="area">The area: connections, request or maskinporten.</param>
        /// <param name="query">Anchor, filters and paging.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The page of entries and the link to the next page, if any.</returns>
        Task<PaginatedResult<ActivityLogDto>> GetActivityLog(string area, ActivityLogQuery query, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the values occurring in the party's slice of the area for one filter field.
        /// </summary>
        /// <param name="area">The area: connections, request or maskinporten.</param>
        /// <param name="field">The filter field.</param>
        /// <param name="query">Anchor, filters, term and paging.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The page of values and the link to the next page, if any.</returns>
        Task<PaginatedResult<ActivityLogFilterValueDto>> GetFilterValues(string area, string field, ActivityLogFilterValuesQuery query, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the activity type catalog entries the area accepts, translated to the given language.
        /// </summary>
        /// <param name="area">The area: connections, request or maskinporten.</param>
        /// <param name="languageCode">The language code in backend standard (nb, nn or en).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The catalog entries.</returns>
        Task<IEnumerable<ActivityTypeDto>> GetActivityTypes(string area, string languageCode, CancellationToken cancellationToken = default);
    }
}
