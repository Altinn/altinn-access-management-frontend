using System.Security.Claims;
using Altinn.AccessManagement.UI.Core.Constants;
using Microsoft.AspNetCore.Http;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// helper class for authentication
    /// </summary>
    public static class AuthenticationHelper
    {
        /// <summary>
        /// Gets the users id
        /// </summary>
        /// <param name="context">the http context</param>
        /// <returns>the logged in users id</returns>
        public static int GetUserId(HttpContext context)
        {
            int userId = 0;

            if (context.User != null)
            {
                foreach (Claim claim in context.User.Claims)
                {
                    if (claim.Type.Equals(AltinnCoreClaimTypes.UserId))
                    {
                        userId = Convert.ToInt32(claim.Value);
                    }
                }
            }

            return userId;
        }

        /// <summary>
        /// Gets the users authentication level
        /// </summary>
        /// <param name="context">the http context</param>
        /// <returns>the logged in users authentication level</returns>
        public static int GetUserAuthenticationLevel(HttpContext context)
        {
            int authenticationLevel = 0;

            if (context.User != null)
            {
                foreach (Claim claim in context.User.Claims)
                {
                    if (claim.Type.Equals(AltinnCoreClaimTypes.AuthenticationLevel))
                    {
                        authenticationLevel = Convert.ToInt32(claim.Value);
                    }
                }
            }

            return authenticationLevel;
        }

        /// <summary>
        /// Gets the users party id
        /// </summary>
        /// <param name="context">the http context</param>
        /// <returns>the logged in user's partyID</returns>
        public static string GetUserPartyId(HttpContext context)
        {
            string partyID = string.Empty;

            if (context.User != null)
            {
                foreach (Claim claim in context.User.Claims)
                {
                    if (claim.Type.Equals(AltinnCoreClaimTypes.PartyID))
                    {
                        partyID = claim.Value;
                    }
                }
            }

            return partyID;
        }

        /// <summary>
        /// Gets the user's party UUID (urn:altinn:party:uuid) from JWT claims.
        /// </summary>
        /// <param name="context">The HTTP context.</param>
        /// <returns>The logged-in user's party UUID, or null if not present/invalid.</returns>
        public static Guid? GetUserPartyUuid(HttpContext context)
        {
            var user = context?.User;
            if (user?.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            string? raw = user.FindFirst(AltinnCoreClaimTypes.PartyUuid)?.Value;
            if (Guid.TryParse(raw, out var uuid))
            {
                return uuid;
            }

            return null;
        }
    }
}
