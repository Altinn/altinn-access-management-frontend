using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.User.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.Common.Frontend
{
    /// <summary>
    /// Collects the parties contained in frontend models, so they can be enriched after mapping
    /// </summary>
    public static class PartyFEExtensions
    {
        /// <summary>
        /// Gets the party of each connection, including the nested connections
        /// </summary>
        public static IEnumerable<PartyFE> FlattenParties(this IEnumerable<ConnectionFE> connections)
        {
            foreach (ConnectionFE connection in connections ?? [])
            {
                if (connection == null)
                {
                    continue;
                }

                if (connection.Party != null)
                {
                    yield return connection.Party;
                }

                foreach (PartyFE party in connection.Connections.FlattenParties())
                {
                    yield return party;
                }
            }
        }

        /// <summary>
        /// Gets the to party of each permission
        /// </summary>
        public static IEnumerable<PartyFE> FlattenParties(this IEnumerable<PermissionFE> permissions)
        {
            foreach (PermissionFE permission in permissions ?? [])
            {
                if (permission?.To != null)
                {
                    yield return permission.To;
                }
            }
        }
    }
}
