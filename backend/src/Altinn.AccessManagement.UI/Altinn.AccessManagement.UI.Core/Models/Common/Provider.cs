namespace Altinn.AccessManagement.UI.Core.Models.Common
{
    /// <summary>
    /// Provider
    /// </summary>
    public class Provider
    {
        /// <summary>
        /// Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Refrence Identifier (e.g. OrgNo)
        /// </summary>
        public string RefId { get; set; }
    }
}
