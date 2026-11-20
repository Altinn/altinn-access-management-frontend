using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the activity log endpoints of the access management API.
    /// </summary>
    public class ActivityLogService : IActivityLogService
    {
        private readonly IActivityLogClient _activityLogClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="ActivityLogService"/> class.
        /// </summary>
        /// <param name="activityLogClient">Activity log client.</param>
        public ActivityLogService(IActivityLogClient activityLogClient)
        {
            _activityLogClient = activityLogClient;
        }

        /// <inheritdoc />
        public Task<PaginatedResult<ActivityLogDto>> GetActivityLog(string area, ActivityLogQuery query, CancellationToken cancellationToken = default)
        {
            return _activityLogClient.GetActivityLog(area, query, cancellationToken);
        }

        /// <inheritdoc />
        public Task<PaginatedResult<ActivityLogFilterValueDto>> GetFilterValues(string area, string field, ActivityLogFilterValuesQuery query, CancellationToken cancellationToken = default)
        {
            return _activityLogClient.GetFilterValues(area, field, query, cancellationToken);
        }

        /// <inheritdoc />
        public Task<IEnumerable<ActivityTypeDto>> GetActivityTypes(string area, string languageCode, CancellationToken cancellationToken = default)
        {
            return _activityLogClient.GetActivityTypes(area, languageCode, cancellationToken);
        }
    }
}
