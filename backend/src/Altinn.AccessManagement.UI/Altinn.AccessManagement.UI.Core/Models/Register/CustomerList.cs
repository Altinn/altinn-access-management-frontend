namespace Altinn.AccessManagement.UI.Core.Models.Register
{
    /// <summary>
    /// A list of customers party records.
    /// </summary>
    public record CustomerList
    {
        /// <summary>
        /// List data wrapper
        /// </summary>
        public List<PartyRecord> Data { get; set; }
    }
}