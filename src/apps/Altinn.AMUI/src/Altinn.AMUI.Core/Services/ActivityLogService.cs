using Altinn.AMUI.Core.ClientInterfaces;
using Altinn.AMUI.Core.Models.ActivityLog;
using Altinn.AMUI.Core.Models.Common;
using Altinn.AMUI.Core.Services.Interfaces;

namespace Altinn.AMUI.Core.Services
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
    }
}
