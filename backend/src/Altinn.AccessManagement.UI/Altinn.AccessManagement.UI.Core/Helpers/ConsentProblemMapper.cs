using System.Net;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Problem descriptors for the consent BFF.
    /// </summary>
    public static class ConsentProblemMapper
    {
        /// <summary>
        /// Map error codes from AM to CTUI error codes
        /// </summary>
        public static ProblemDescriptor MapToConsentUiError(AltinnProblemDetails problemDetails, HttpStatusCode statusCode)
        {
            if (!string.IsNullOrEmpty(problemDetails?.ErrorCode.ToString()))
            {
                return problemDetails?.ErrorCode.ToString() switch
                {
                    "AM-00000" => ConsentProblem.NotAuthorizedForConsentRequest,
                    "AM-00001" => ConsentProblem.ConsentNotFound,
                    "AM-00002" => ConsentProblem.ConsentCantBeAccepted,
                    "AM-00010" => ConsentProblem.ConsentCantBeRevoked,
                    "AM-00011" => ConsentProblem.ConsentRevoked,
                    "AM-00013" => ConsentProblem.ConsentExpired,
                    "AM-00014" => ConsentProblem.ConsentNotAccepted,
                    "AM-00015" => ConsentProblem.ConsentCantBeRejected,
                    _ => ConsentProblem.UnknownError
                };
            }
            else if (statusCode == HttpStatusCode.Unauthorized)
            {
                return ConsentProblem.UnauthorizedUser;
            }

            return ConsentProblem.UnknownError;
        }
    }
}