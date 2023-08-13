namespace Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner
{
    /// <summary>
    ///     Describes an organization in the resource registry
    /// </summary>
    public class Org
    {
        /// <summary>
        ///     Name of organization. With lanugage support
        /// </summary>
        public Name Name { get; set; }

        /// <summary>
        ///     The logo
        /// </summary>
        public string Logo { get; set; }

        /// <summary>
        ///     The organization number
        /// </summary>
        public string Orgnr { get; set; }

        /// <summary>
        ///     The homepage
        /// </summary>
        public string Homepage { get; set; }

        /// <summary>
        ///     The environments available for the organzation
        /// </summary>
        public List<string> Environments { get; set; }
    }
}
