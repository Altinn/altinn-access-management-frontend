using Altinn.AMUI.Core.ClientInterfaces;
using Altinn.AMUI.Core.Models.ActivityLog;
using Altinn.AMUI.Core.Models.Common;
using Altinn.AMUI.Mocks.Utils;

namespace Altinn.AMUI.Mocks.Mocks
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

            // The values are looked up in the full search, except that the field being looked up
            // disregards its own filter.
            ActivityLogQuery lookupQuery = new ActivityLogQuery
            {
                Party = query.Party,
                Direction = query.Direction,
                From = string.Equals(field, "from", StringComparison.OrdinalIgnoreCase) ? new List<Guid>() : query.From,
                To = string.Equals(field, "to", StringComparison.OrdinalIgnoreCase) ? new List<Guid>() : query.To,
                Via = query.Via,
                By = string.Equals(field, "by", StringComparison.OrdinalIgnoreCase) ? new List<Guid>() : query.By,
                TypeId = query.TypeId,
                After = query.After,
                Before = query.Before,
            };

            IEnumerable<ActivityLogFilterValueDto> values = GetEntriesInSearch(area, lookupQuery)
                .Select(entry => GetFieldValue(entry, field))
                .Where(value => value != null)
                .DistinctBy(value => (value.Id, value.Name));

            if (!string.IsNullOrWhiteSpace(query.Term))
            {
                values = values.Where(value => value.Name?.Contains(query.Term, StringComparison.OrdinalIgnoreCase) == true);
            }

            List<ActivityLogFilterValueDto> ordered = string.Equals(query.OrderBy, "When", StringComparison.OrdinalIgnoreCase)
                ? values.ToList()
                : values.OrderBy(value => value.Name).ToList();
            return Task.FromResult(Page(ordered, query));
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

            if (query.Via?.Count > 0)
            {
                entries = entries.Where(entry => entry.ViaId.HasValue && query.Via.Contains(entry.ViaId.Value));
            }

            if (query.By?.Count > 0)
            {
                entries = entries.Where(entry => entry.ById.HasValue && query.By.Contains(entry.ById.Value));
            }

            if (query.TypeId?.Count > 0)
            {
                entries = entries.Where(entry => entry.ActivityTypeId.HasValue && query.TypeId.Contains(entry.ActivityTypeId.Value));
            }

            if (query.After.HasValue)
            {
                entries = entries.Where(entry => entry.When >= query.After.Value);
            }

            if (query.Before.HasValue)
            {
                entries = entries.Where(entry => entry.When <= query.Before.Value);
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

            // The next link repeats the whole query, as the API does, so following it gives the next page
            // of the same search.
            string next = null;
            if (hasMore)
            {
                IEnumerable<string> search = query.ToQueryString()
                    .Split('&')
                    .Where(parameter => !parameter.StartsWith("pageNo=", StringComparison.Ordinal) && !parameter.StartsWith("pageSize=", StringComparison.Ordinal));
                next = $"?{string.Join("&", search)}&pageNo={pageNo + 1}&pageSize={pageSize}";
            }

            return PaginatedResult.Create(page, next);
        }
    }
}
