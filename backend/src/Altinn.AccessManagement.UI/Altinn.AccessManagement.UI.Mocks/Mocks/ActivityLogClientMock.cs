using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IActivityLogClient"/>. Plays the part of the area endpoints over the
    /// entries in <c>Data/ActivityLog/{area}.json</c>: anchors on the party and direction, applies the
    /// counterpart filters and pages the result.
    /// </summary>
    public class ActivityLogClientMock : IActivityLogClient
    {
        private const int DefaultPageSize = 100;

        private readonly string dataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="ActivityLogClientMock"/> class.
        /// </summary>
        public ActivityLogClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(ActivityLogClientMock).Assembly.Location).LocalPath), "Data", "ActivityLog");
        }

        /// <inheritdoc />
        public Task<PaginatedResult<ActivityLogDto>> GetActivityLog(string area, ActivityLogQuery query, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(query.Party.ToString());

            List<ActivityLogDto> entries = GetEntriesInSearch(area, query).ToList();
            return Task.FromResult(Page(entries, query));
        }

        /// <inheritdoc />
        public Task<PaginatedResult<ActivityLogFilterValueDto>> GetFilterValues(string area, string field, ActivityLogFilterValuesQuery query, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(query.Party.ToString());

            // The field being looked up disregards its own filter.
            ActivityLogQuery lookupQuery = new ActivityLogQuery
            {
                Party = query.Party,
                Direction = query.Direction,
                From = string.Equals(field, "from", StringComparison.OrdinalIgnoreCase) ? new List<Guid>() : query.From,
                To = string.Equals(field, "to", StringComparison.OrdinalIgnoreCase) ? new List<Guid>() : query.To,
            };

            IEnumerable<ActivityLogFilterValueDto> values = GetEntriesInSearch(area, lookupQuery)
                .Select(entry => GetFieldValue(entry, field))
                .Where(value => value != null)
                .DistinctBy(value => (value.Id, value.Name));

            if (!string.IsNullOrWhiteSpace(query.Term))
            {
                values = values.Where(value => value.Name.Contains(query.Term, StringComparison.OrdinalIgnoreCase));
            }

            List<ActivityLogFilterValueDto> ordered = values.OrderBy(value => value.Name).ToList();
            return Task.FromResult(Page(ordered, query));
        }

        /// <inheritdoc />
        public Task<IEnumerable<ActivityTypeDto>> GetActivityTypes(string area, string languageCode, CancellationToken cancellationToken = default)
        {
            string dataPath = Path.Combine(dataFolder, $"{area}_types.json");
            return Task.FromResult<IEnumerable<ActivityTypeDto>>(Util.GetMockData<List<ActivityTypeDto>>(dataPath));
        }

        private IEnumerable<ActivityLogDto> GetEntriesInSearch(string area, ActivityLogQuery query)
        {
            string dataPath = Path.Combine(dataFolder, $"{area}.json");
            IEnumerable<ActivityLogDto> entries = Util.GetMockData<List<ActivityLogDto>>(dataPath);

            bool fromParty = string.Equals(query.Direction, "from", StringComparison.OrdinalIgnoreCase);
            entries = entries.Where(entry => (fromParty ? entry.FromId : entry.ToId) == query.Party);

            if (query.From?.Count > 0)
            {
                entries = entries.Where(entry => entry.FromId.HasValue && query.From.Contains(entry.FromId.Value));
            }

            if (query.To?.Count > 0)
            {
                entries = entries.Where(entry => entry.ToId.HasValue && query.To.Contains(entry.ToId.Value));
            }

            return entries.OrderByDescending(entry => entry.When).ThenByDescending(entry => entry.Id);
        }

        private static ActivityLogFilterValueDto GetFieldValue(ActivityLogDto entry, string field)
        {
            switch (field.ToLowerInvariant())
            {
                case "from":
                    return ToFilterValue(entry.FromId, entry.FromName);
                case "to":
                    return ToFilterValue(entry.ToId, entry.ToName);
                case "by":
                    return ToFilterValue(entry.ById, entry.ByName);
                case "resource":
                    return ToFilterValue(entry.ResourceId, entry.ResourceName);
                default:
                    return null;
            }
        }

        private static ActivityLogFilterValueDto ToFilterValue(Guid? id, string name)
        {
            return id.HasValue ? new ActivityLogFilterValueDto { Id = id.Value, Name = name } : null;
        }

        private static PaginatedResult<T> Page<T>(List<T> items, ActivityLogQuery query)
        {
            int pageSize = query.PageSize ?? DefaultPageSize;
            int pageNo = query.PageNo ?? 0;
            List<T> page = items.Skip(pageNo * pageSize).Take(pageSize).ToList();
            bool hasMore = (pageNo + 1) * pageSize < items.Count;

            return PaginatedResult.Create(page, hasMore ? $"?pageNo={pageNo + 1}&pageSize={pageSize}" : null);
        }
    }
}
