using System.Text.Json;

namespace Altinn.AccessManagement.UI.Core.Models.ActivityLog
{
    /// <summary>
    /// One entry in the activity log, as served by the access management API. Names are snapshots
    /// taken when the event happened.
    /// </summary>
    public class ActivityLogDto
    {
        /// <summary>
        /// Gets or sets the id of the entry.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the record type: Assignment, Delegation or Request.
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets the child record category (Package, Resource or Instance), or null when the entry
        /// describes the main record itself.
        /// </summary>
        public string Subtype { get; set; }

        /// <summary>
        /// Gets or sets what happened: Created, Updated or Deleted.
        /// </summary>
        public string Trigger { get; set; }

        /// <summary>
        /// Gets or sets the (new) request status for request entries.
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Gets or sets when the event happened.
        /// </summary>
        public DateTimeOffset When { get; set; }

        /// <summary>
        /// Gets or sets the id of the user or system that performed the change.
        /// </summary>
        public Guid? ById { get; set; }

        /// <summary>
        /// Gets or sets the name of the user or system that performed the change.
        /// </summary>
        public string ByName { get; set; }

        /// <summary>
        /// Gets or sets the id of the system or channel the change came through.
        /// </summary>
        public Guid? SourceId { get; set; }

        /// <summary>
        /// Gets or sets the name of the system or channel the change came through.
        /// </summary>
        public string SourceName { get; set; }

        /// <summary>
        /// Gets or sets the operation (trace) id shared by all entries written by one user action.
        /// </summary>
        public string OperationId { get; set; }

        /// <summary>
        /// Gets or sets the id of the party that gave access.
        /// </summary>
        public Guid? FromId { get; set; }

        /// <summary>
        /// Gets or sets the name of the party that gave access.
        /// </summary>
        public string FromName { get; set; }

        /// <summary>
        /// Gets or sets the type of the party that gave access.
        /// </summary>
        public string FromType { get; set; }

        /// <summary>
        /// Gets or sets the id of the party that received access.
        /// </summary>
        public Guid? ToId { get; set; }

        /// <summary>
        /// Gets or sets the name of the party that received access.
        /// </summary>
        public string ToName { get; set; }

        /// <summary>
        /// Gets or sets the type of the party that received access.
        /// </summary>
        public string ToType { get; set; }

        /// <summary>
        /// Gets or sets the id of the facilitator party for delegation entries.
        /// </summary>
        public Guid? ViaId { get; set; }

        /// <summary>
        /// Gets or sets the name of the facilitator party for delegation entries.
        /// </summary>
        public string ViaName { get; set; }

        /// <summary>
        /// Gets or sets the type of the facilitator party for delegation entries.
        /// </summary>
        public string ViaType { get; set; }

        /// <summary>
        /// Gets or sets the id of the role.
        /// </summary>
        public Guid? RoleId { get; set; }

        /// <summary>
        /// Gets or sets the name of the role.
        /// </summary>
        public string RoleName { get; set; }

        /// <summary>
        /// Gets or sets the id of the facilitator role for delegation entries.
        /// </summary>
        public Guid? ViaRoleId { get; set; }

        /// <summary>
        /// Gets or sets the name of the facilitator role for delegation entries.
        /// </summary>
        public string ViaRoleName { get; set; }

        /// <summary>
        /// Gets or sets the id of the access package.
        /// </summary>
        public Guid? PackageId { get; set; }

        /// <summary>
        /// Gets or sets the name of the access package.
        /// </summary>
        public string PackageName { get; set; }

        /// <summary>
        /// Gets or sets the id of the resource.
        /// </summary>
        public Guid? ResourceId { get; set; }

        /// <summary>
        /// Gets or sets the name of the resource.
        /// </summary>
        public string ResourceName { get; set; }

        /// <summary>
        /// Gets or sets the instance URN.
        /// </summary>
        public string InstanceId { get; set; }

        /// <summary>
        /// Gets or sets the id of the affected row.
        /// </summary>
        public Guid ItemId { get; set; }

        /// <summary>
        /// Gets or sets the id of the affected row's main record.
        /// </summary>
        public Guid? ParentId { get; set; }

        /// <summary>
        /// Gets or sets additional event data (previous status, request action, provenance references).
        /// </summary>
        public JsonElement? Details { get; set; }

        /// <summary>
        /// Gets or sets the activity type catalog entry for the event.
        /// </summary>
        public Guid? ActivityTypeId { get; set; }
    }
}
