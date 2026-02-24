using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Problem descriptors for the consent BFF.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public static class ConsentProblemMapper
    {
        /// <summary>
        /// Map error codes from AM to CTUI error codes
        /// </summary>
        public static ProblemDescriptor MapToConsentUiError(string responseContent, HttpStatusCode statusCode)
        {
            try
            {
                AltinnProblemDetails problemDetails = JsonSerializer.Deserialize<AltinnProblemDetails>(responseContent);
                string authErrorCode = problemDetails?.ErrorCode.ToString();

                if (!string.IsNullOrEmpty(authErrorCode))
                {
                    return authErrorCode switch
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
            catch
            {
                // In case of deserialization failure or any other exception, return a generic problem descriptor
                return ConsentProblem.CreateGenericProblem(statusCode, "Error without problem code");
            }
        }
    }
}