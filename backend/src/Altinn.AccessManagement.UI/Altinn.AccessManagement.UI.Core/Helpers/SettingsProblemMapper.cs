using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Maps error responses from the notification address endpoints in Profile to settings problem descriptors.
    /// </summary>
    public static class SettingsProblemMapper
    {
        private const string InvalidOrganizationNumberTitle = "Invalid Organization Number";

        /// <summary>
        /// Profile returns plain problem details without error codes, so the status code, the
        /// http method and the content of the response are what tells the errors apart.
        /// </summary>
        /// <param name="responseContent">The body of the response from Profile</param>
        /// <param name="statusCode">The status code of the response from Profile</param>
        /// <param name="method">The http method of the request to Profile</param>
        /// <returns>The matching problem descriptor</returns>
        public static ProblemDescriptor MapToSettingsUiError(string responseContent, HttpStatusCode statusCode, HttpMethod method)
        {
            return statusCode switch
            {
                HttpStatusCode.BadRequest => MapBadRequest(responseContent),
                HttpStatusCode.Conflict when method == HttpMethod.Put => SettingsProblem.AddressAlreadyExists,
                HttpStatusCode.Conflict when method == HttpMethod.Delete => SettingsProblem.CannotDeleteLastAddress,
                HttpStatusCode.NotFound => SettingsProblem.AddressNotFound,
                HttpStatusCode.Forbidden => SettingsProblem.NotAuthorized,
                HttpStatusCode.Unauthorized => SettingsProblem.UnauthorizedUser,
                _ => SettingsProblem.UnknownError,
            };
        }

        private static ProblemDescriptor MapBadRequest(string responseContent)
        {
            try
            {
                using JsonDocument document = JsonDocument.Parse(responseContent);
                JsonElement root = document.RootElement;

                if (root.ValueKind != JsonValueKind.Object)
                {
                    return SettingsProblem.UnknownError;
                }

                if (root.TryGetProperty("errors", out JsonElement errors) && errors.ValueKind == JsonValueKind.Object)
                {
                    return MapValidationErrors(errors);
                }

                bool isInvalidOrganization = root.TryGetProperty("title", out JsonElement title)
                    && title.ValueKind == JsonValueKind.String
                    && title.GetString() == InvalidOrganizationNumberTitle;

                return isInvalidOrganization ? SettingsProblem.OrganizationNotInEr : SettingsProblem.UnknownError;
            }
            catch (JsonException)
            {
                return SettingsProblem.UnknownError;
            }
        }

        private static ProblemDescriptor MapValidationErrors(JsonElement errors)
        {
            bool hasPhoneError = errors.TryGetProperty("Phone", out _);
            bool hasEmailError = errors.TryGetProperty("Email", out _);

            if (errors.TryGetProperty("CountryCode", out _))
            {
                return SettingsProblem.InvalidCountryCode;
            }

            if (hasPhoneError && !hasEmailError)
            {
                return SettingsProblem.InvalidPhone;
            }

            if (hasEmailError && !hasPhoneError)
            {
                return SettingsProblem.InvalidEmail;
            }

            return SettingsProblem.UnknownError;
        }
    }
}
