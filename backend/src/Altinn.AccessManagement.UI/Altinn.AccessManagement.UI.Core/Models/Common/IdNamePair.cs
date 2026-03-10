namespace Altinn.AccessManagement.UI.Core.Models.Common
{
    /// <summary>
    /// Represents a reusable identifier and display name pair.
    /// </summary>
    /// <typeparam name="TId">The identifier type.</typeparam>
    public class IdNamePair<TId>
    {
        /// <summary>
        /// Gets or sets the identifier.
        /// </summary>
        public TId Id { get; set; }

        /// <summary>
        /// Gets or sets the display name.
        /// </summary>
        public string Name { get; set; }
    }
}
