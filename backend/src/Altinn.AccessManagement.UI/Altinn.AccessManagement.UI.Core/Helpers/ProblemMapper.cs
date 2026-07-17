using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Problem descriptors for the Systemuser BFF.
    /// </summary>
    public static class ProblemMapper
    {
        /// <summary>
        /// Extension members forwarded verbatim from the upstream (authentication) problem so the
        /// specifics (e.g. which access package/right could not be delegated and why) survive to the
        /// frontend instead of being flattened to just the error code.
        /// </summary>
        private static readonly string[] ForwardableExtensionKeys = ["delegationReasons"];

        /// <summary>
        /// Map error codes from AUTH to AMUI error codes
        /// </summary>
        public static ProblemInstance MapToAuthUiError(string responseContent, HttpStatusCode statusCode)
        {
            try
            {
                AltinnProblemDetails problemDetails = JsonSerializer.Deserialize<AltinnProblemDetails>(responseContent);
                string authErrorCode = problemDetails?.ErrorCode.ToString();

                ProblemDescriptor descriptor = authErrorCode switch
                {
                    "AUTH-00001" => Problem.Rights_NotFound_Or_NotDelegable,
                    "AUTH-00002" => Problem.Rights_FailedToDelegate,
                    "AUTH-00003" => Problem.SystemUser_FailedToCreate,
                    "AUTH-00004" => Problem.SystemUser_AlreadyExists,
                    "AUTH-00011" => Problem.SystemIdNotFound,
                    "AUTH-00014" => Problem.UnableToDoDelegationCheck,
                    "AUTH-00016" => Problem.DelegationRightMissingRoleAccess,
                    "AUTH-00018" => Problem.DelegationRightMissingDelegationAccess,
                    "AUTH-00019" => Problem.DelegationRightMissingSrrRightAccess,
                    "AUTH-00020" => Problem.DelegationRightInsufficientAuthenticationLevel,
                    "AUTH-00028" => Problem.CustomerIdNotFound,
                    "AUTH-00043" => Problem.AgentSystemUser_FailedToGetClients_Unauthorized,
                    "AUTH-00044" => Problem.AgentSystemUser_FailedToGetClients_Forbidden,
                    "AUTH-00045" => Problem.AgentSystemUser_FailedToGetClients,
                    "AUTH-00050" => Problem.AccessPackage_DelegationCheckFailed,
                    "AUTH-00051" => Problem.AccessPackage_DelegationFailed,
                    "AUTH-00053" => Problem.AccessPackage_Delegation_MissingRequiredAccess,
                    "AUTH-00055" => Problem.AccessPackage_FailedToGetDelegatedPackages,
                    "AUTH-00057" => Problem.SystemUser_FailedToDeleteAccessPackage,
                    "AUTH-00062" => Problem.SystemUser_FailedToGetDelegatedRights,
                    "AUTH-00066" => Problem.Request_UserIsNotAccessManager,
                    "AUTH-00068" => Problem.DelegationRightMissingPackageAccess,

                    _ => Problem.Generic_EndOfMethod,
                };

                // Forward the detail extensions (e.g. "delegationReasons") from the upstream problem so
                // the reason survives to the frontend instead of being reduced to just the error code.
                List<KeyValuePair<string, string>> forwarded = ExtractForwardableExtensions(problemDetails);

                // Always return a ProblemInstance explicitly (never rely on the implicit
                // ProblemDescriptor -> ProblemInstance conversion) so the return type is consistent.
                return forwarded.Count > 0
                    ? descriptor.Create(ProblemExtensionData.Create([.. forwarded]))
                    : descriptor.Create();
            }
            catch
            {
                // In case of deserialization failure or any other exception, return a generic problem instance.
                return Problem.CreateGenericProblem(statusCode, "Error without problem code").Create();
            }
        }

        private static List<KeyValuePair<string, string>> ExtractForwardableExtensions(AltinnProblemDetails problemDetails)
        {
            List<KeyValuePair<string, string>> forwarded = [];

            if (problemDetails?.Extensions is null)
            {
                return forwarded;
            }

            foreach (string key in ForwardableExtensionKeys)
            {
                if (!problemDetails.Extensions.TryGetValue(key, out object value) || value is null)
                {
                    continue;
                }

                string text = value is JsonElement element
                    ? (element.ValueKind == JsonValueKind.String ? element.GetString() : element.ToString())
                    : value.ToString();

                if (!string.IsNullOrWhiteSpace(text))
                {
                    forwarded.Add(new KeyValuePair<string, string>(key, text));
                }
            }

            return forwarded;
        }

        /// <summary>
        /// Map error codes from AM to AMUI error codes
        /// </summary>
        public static AltinnValidationError MapToAmUiError(string errorCode)
        {
            return errorCode switch
            {
                // We only handle "Resource must be valid" for now
                // Add more cases here when available
                // "AM.VLD-00001" => AmProblem.InvalidPartyUrn.ToValidationError(),
                "AM.VLD-00002" => AmProblem.InvalidResource.ToValidationError(),
                "AM.VLD-00028" => AmProblem.InvalidUnitType.ToValidationError(),
                _ => null
            };
        }
    }
}
