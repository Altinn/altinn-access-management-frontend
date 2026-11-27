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

            // The values are looked up in the full search, except that the field being looked up
            // disregards its own filter.
            ActivityLogQuery lookupQuery = WithoutOwnFilter(query, field);

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

        /// <inheritdoc />
        public Task<IEnumerable<string>> GetFilterFields(string area, CancellationToken cancellationToken = default)
        {
            string dataPath = Path.Combine(dataFolder, $"{area}_filter_fields.json");
            return Task.FromResult<IEnumerable<string>>(Util.GetMockData<List<string>>(dataPath));
        }

        private static ActivityLogQuery WithoutOwnFilter(ActivityLogQuery query, string field)
        {
            ActivityLogQuery lookupQuery = new ActivityLogQuery
            {
                Party = query.Party,
                Direction = query.Direction,
                From = query.From,
                To = query.To,
                Via = query.Via,
                By = query.By,
                Role = query.Role,
                Package = query.Package,
                Resource = query.Resource,
                Source = query.Source,
                TypeId = query.TypeId,
                After = query.After,
                Before = query.Before,
            };

            switch (field.ToLowerInvariant())
            {
                case "from":
                    lookupQuery.From = new List<Guid>();
                    break;
                case "to":
                    lookupQuery.To = new List<Guid>();
                    break;
                case "via":
                    lookupQuery.Via = new List<Guid>();
                    break;
                case "by":
                    lookupQuery.By = new List<Guid>();
                    break;
                case "role":
                    lookupQuery.Role = new List<Guid>();
                    break;
                case "package":
                    lookupQuery.Package = new List<Guid>();
                    break;
                case "resource":
                    lookupQuery.Resource = new List<Guid>();
                    break;
                case "source":
                    lookupQuery.Source = new List<Guid>();
                    break;
                case "activitytype":
                    lookupQuery.TypeId = new List<Guid>();
                    break;
            }

            return lookupQuery;
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

            if (query.Role?.Count > 0)
            {
                entries = entries.Where(entry => entry.RoleId.HasValue && query.Role.Contains(entry.RoleId.Value));
            }

            if (query.Package?.Count > 0)
            {
                entries = entries.Where(entry => entry.PackageId.HasValue && query.Package.Contains(entry.PackageId.Value));
            }

            if (query.Resource?.Count > 0)
            {
                entries = entries.Where(entry => entry.ResourceId.HasValue && query.Resource.Contains(entry.ResourceId.Value));
            }

            if (query.Source?.Count > 0)
            {
                entries = entries.Where(entry => entry.SourceId.HasValue && query.Source.Contains(entry.SourceId.Value));
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
                case "via":
                    return ToFilterValue(entry.ViaId, entry.ViaName);
                case "by":
                    return ToFilterValue(entry.ById, entry.ByName);
                case "role":
                    return ToFilterValue(entry.RoleId, entry.RoleName);
                case "package":
                    return ToFilterValue(entry.PackageId, entry.PackageName);
                case "resource":
                    return ToFilterValue(entry.ResourceId, entry.ResourceName);
                case "source":
                    return ToFilterValue(entry.SourceId, entry.SourceName);
                case "activitytype":
                    // The API names the type from its catalog; the mock names it from the entry's own fields.
                    return ToFilterValue(entry.ActivityTypeId, string.Join(" ", new[] { entry.Type, entry.Subtype, entry.Trigger }.Where(part => !string.IsNullOrEmpty(part))));
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
