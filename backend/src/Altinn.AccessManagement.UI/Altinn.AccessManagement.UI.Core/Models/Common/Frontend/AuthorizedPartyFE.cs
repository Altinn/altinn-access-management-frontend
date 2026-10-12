using Altinn.AccessManagement.UI.Core.Models.AccessManagement;

namespace Altinn.AccessManagement.UI.Core.Models.Common.Frontend
{
    /// <summary>
    /// A party the user is authorized to act on behalf of (a reportee), as sent to the frontend.
    /// </summary>
    public class AuthorizedPartyFE : PartyFE
    {
        /// <summary>
        /// Gets or sets the resources the user has access to for this party
        /// </summary>
        public List<string> AuthorizedResources { get; set; } = new List<string>();

        /// <summary>
        /// Gets or sets the roles the user has for this party
        /// </summary>
        public List<string> AuthorizedRoles { get; set; } = new List<string>();

        /// <summary>
        /// Gets or sets a value indicating whether the party is only in the list to show the hierarchy (a parent unit with no access)
        /// </summary>
        public bool OnlyHierarchyElementWithNoAccess { get; set; }

        /// <summary>
        /// Gets or sets the subunits. Hides <see cref="PartyFE.Children"/> so the subunits serialize with their authorization fields.
        /// </summary>
        public new List<AuthorizedPartyFE> Children { get; set; }

        /// <summary>
        /// Maps an authorized party from the access management actor list endpoints
        /// </summary>
        public static AuthorizedPartyFE FromAuthorizedParty(AuthorizedParty party)
        {
            if (party == null)
            {
                return null;
            }

            var partyFE = new AuthorizedPartyFE
            {
                AuthorizedResources = party.AuthorizedResources ?? new List<string>(),
                AuthorizedRoles = party.AuthorizedRoles ?? new List<string>(),
                OnlyHierarchyElementWithNoAccess = party.OnlyHierarchyElementWithNoAccess,
                Children = party.Subunits?.Select(FromAuthorizedParty).ToList(),
            };
            CopyFrom(party, partyFE);
            return partyFE;
        }
    }
}
