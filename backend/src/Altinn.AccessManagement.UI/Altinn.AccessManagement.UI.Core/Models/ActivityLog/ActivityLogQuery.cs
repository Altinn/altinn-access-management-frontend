using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models.ActivityLog
{
    /// <summary>
    /// Query parameters for the activity log of one area. Values within one list are OR'ed; different
    /// parameters are AND'ed.
    /// </summary>
    public class ActivityLogQuery
    {
        /// <summary>
        /// Gets or sets the party the log is anchored on.
        /// </summary>
        [Required]
        public Guid Party { get; set; }

        /// <summary>
        /// Gets or sets the direction: "from" for access given by the party, "to" for access received by it.
        /// </summary>
        [Required]
        [RegularExpression("^(from|to)$")]
        public string Direction { get; set; }

        /// <summary>
        /// Gets or sets the parties that gave access.
        /// </summary>
        public List<Guid> From { get; set; } = new List<Guid>();

        /// <summary>
        /// Gets or sets the parties that received access.
        /// </summary>
        public List<Guid> To { get; set; } = new List<Guid>();

        /// <summary>
        /// Gets or sets the facilitator parties.
        /// </summary>
        public List<Guid> Via { get; set; } = new List<Guid>();

        /// <summary>
        /// Gets or sets the users or systems that performed the change.
        /// </summary>
        public List<Guid> By { get; set; } = new List<Guid>();

        /// <summary>
        /// Gets or sets the activity type catalog entries to include.
        /// </summary>
        public List<Guid> TypeId { get; set; } = new List<Guid>();

        /// <summary>
        /// Gets or sets the lower bound on when the event happened.
        /// </summary>
        public DateTimeOffset? After { get; set; }

        /// <summary>
        /// Gets or sets the upper bound on when the event happened.
        /// </summary>
        public DateTimeOffset? Before { get; set; }

        /// <summary>
        /// Gets or sets the 0-based page number.
        /// </summary>
        [Range(0, int.MaxValue)]
        public int? PageNo { get; set; }

        /// <summary>
        /// Gets or sets the page size (the API defaults to 100 and clamps to 1–1000).
        /// </summary>
        [Range(1, 1000)]
        public int? PageSize { get; set; }

        /// <summary>
        /// Builds the query string the access management API expects.
        /// </summary>
        /// <returns>The query string, without a leading question mark.</returns>
        public virtual string ToQueryString()
        {
            List<string> parameters = new List<string>
            {
                $"party={Party}",
                $"direction={Direction}",
            };

            parameters.AddRange(From.Select(id => $"from={id}"));
            parameters.AddRange(To.Select(id => $"to={id}"));
            parameters.AddRange(Via.Select(id => $"via={id}"));
            parameters.AddRange(By.Select(id => $"by={id}"));
            parameters.AddRange(TypeId.Select(id => $"typeId={id}"));

            if (After.HasValue)
            {
                parameters.Add($"after={Uri.EscapeDataString(After.Value.ToString("O"))}");
            }

            if (Before.HasValue)
            {
                parameters.Add($"before={Uri.EscapeDataString(Before.Value.ToString("O"))}");
            }

            if (PageNo.HasValue)
            {
                parameters.Add($"pageNo={PageNo.Value}");
            }

            if (PageSize.HasValue)
            {
                parameters.Add($"pageSize={PageSize.Value}");
            }

            return string.Join("&", parameters);
        }
    }

    /// <summary>
    /// Query parameters for the values of one filter field. The field being looked up is matched on
    /// the full search, except its own filter.
    /// </summary>
    public class ActivityLogFilterValuesQuery : ActivityLogQuery
    {
        /// <summary>
        /// Gets or sets a case-insensitive substring to match names on.
        /// </summary>
        public string Term { get; set; }

        /// <summary>
        /// Gets or sets the ordering: "Name" (default) or "When" (newest occurrence first).
        /// </summary>
        [RegularExpression("^(Name|When)$")]
        public string OrderBy { get; set; }

        /// <inheritdoc />
        public override string ToQueryString()
        {
            string queryString = base.ToQueryString();

            if (!string.IsNullOrWhiteSpace(Term))
            {
                queryString += $"&term={Uri.EscapeDataString(Term)}";
            }

            if (!string.IsNullOrWhiteSpace(OrderBy))
            {
                queryString += $"&orderBy={OrderBy}";
            }

            return queryString;
        }
    }
}
