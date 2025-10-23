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
        /// Gets the users party uuid
        /// </summary>
        /// <param name="context">the http context</param>
        /// <returns>the logged in user's partyUUID</returns>
        public static Guid GetUserPartyUuid(HttpContext context)
        {
            Guid partyUUID = Guid.Empty;

            if (context.User != null)
            {
                foreach (Claim claim in context.User.Claims)
                {
                    if (claim.Type.Equals(AltinnCoreClaimTypes.PartyUUID))
                    {
                        partyUUID = Guid.Parse(claim.Value);
                    }
                }
            }

            return partyUUID;
        }
    }
}
