namespace Altinn.AccessManagement.UI.Core.Models.Profile
{
    /// <summary>
    /// A group of parties set in the users profile. E.g. their favorites from their actors list
    /// </summary>
    public class ProfileGroup
    {
        /// <summary>
        /// The name of the group
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Whether or not this group represents the user's favorite parties
        /// </summary>
        public bool IsFavorite { get; set; }

        /// <summary>
        /// The partyUuids of the parties in this group
        /// </summary>
        public List<string> Parties { get; set; }
    }
}
