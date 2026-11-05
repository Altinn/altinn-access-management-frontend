using System.Net;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    /// <summary>
    /// Tests <see cref="SettingsProblemMapper"/> with response bodies on the form Profile returns them.
    /// </summary>
    public class SettingsProblemMapperTest
    {
        private static string ValidationBody(string errors) =>
            "{\"type\":\"https://tools.ietf.org/html/rfc9110#section-15.5.1\",\"title\":\"One or more validation errors occurred.\",\"status\":400,\"errors\":{" + errors + "},\"traceId\":\"00-abc-def-00\"}";

        public static TheoryData<string, ProblemDescriptor> ValidationErrors => new()
        {
            { "\"Email\":[\"The field Email must match the regular expression\"]", SettingsProblem.InvalidEmail },
            { "\"Phone\":[\"The field Phone must match the regular expression\"]", SettingsProblem.InvalidPhone },
            { "\"Phone\":[\"Phone number is not valid.\"]", SettingsProblem.InvalidPhone },
            { "\"CountryCode\":[\"CountryCode is required with Phone.\"]", SettingsProblem.InvalidCountryCode },
            { "\"CountryCode\":[\"The field CountryCode must match\"],\"Phone\":[\"The field Phone must match\"]", SettingsProblem.InvalidCountryCode },
            { "\"Phone\":[\"Either Phone or Email must be specified.\"],\"Email\":[\"Either Phone or Email must be specified.\"]", SettingsProblem.UnknownError },
            { "\"OrganizationNumber\":[\"Unexpected field\"]", SettingsProblem.UnknownError },
        };

        [Theory]
        [MemberData(nameof(ValidationErrors))]
        public void MapToSettingsUiError_ValidationErrors_MapsOnFieldName(string errors, ProblemDescriptor expected)
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(ValidationBody(errors), HttpStatusCode.BadRequest, HttpMethod.Post);

            Assert.Equal(expected, actual);
        }

        [Fact]
        public void MapToSettingsUiError_InvalidOrganizationNumber_MapsToOrganizationNotInEr()
        {
            string body = "{\"title\":\"Invalid Organization Number\",\"status\":400,\"detail\":\"The provided organization number is not valid in enhetsregisteret.\"}";

            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(body, HttpStatusCode.BadRequest, HttpMethod.Post);

            Assert.Equal(SettingsProblem.OrganizationNotInEr, actual);
        }

        [Theory]
        [InlineData("")]
        [InlineData("not json")]
        [InlineData("\"Organization number is required\"")]
        [InlineData("{\"title\":\"Some other problem\",\"status\":400}")]
        [InlineData("{\"title\":123,\"status\":400}")]
        public void MapToSettingsUiError_UnrecognizedBadRequest_MapsToUnknownError(string body)
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(body, HttpStatusCode.BadRequest, HttpMethod.Post);

            Assert.Equal(SettingsProblem.UnknownError, actual);
        }

        [Fact]
        public void MapToSettingsUiError_ConflictOnPut_MapsToAddressAlreadyExists()
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(string.Empty, HttpStatusCode.Conflict, HttpMethod.Put);

            Assert.Equal(SettingsProblem.AddressAlreadyExists, actual);
        }

        [Fact]
        public void MapToSettingsUiError_ConflictOnDelete_MapsToCannotDeleteLastAddress()
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(string.Empty, HttpStatusCode.Conflict, HttpMethod.Delete);

            Assert.Equal(SettingsProblem.CannotDeleteLastAddress, actual);
        }

        [Fact]
        public void MapToSettingsUiError_ConflictOnPost_MapsToUnknownError()
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(string.Empty, HttpStatusCode.Conflict, HttpMethod.Post);

            Assert.Equal(SettingsProblem.UnknownError, actual);
        }

        [Fact]
        public void MapToSettingsUiError_NotFound_MapsToAddressNotFound()
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(string.Empty, HttpStatusCode.NotFound, HttpMethod.Put);

            Assert.Equal(SettingsProblem.AddressNotFound, actual);
        }

        [Fact]
        public void MapToSettingsUiError_Forbidden_MapsToNotAuthorized()
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(string.Empty, HttpStatusCode.Forbidden, HttpMethod.Post);

            Assert.Equal(SettingsProblem.NotAuthorized, actual);
        }

        [Fact]
        public void MapToSettingsUiError_Unauthorized_MapsToUnauthorizedUser()
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(string.Empty, HttpStatusCode.Unauthorized, HttpMethod.Post);

            Assert.Equal(SettingsProblem.UnauthorizedUser, actual);
        }

        [Theory]
        [InlineData(HttpStatusCode.InternalServerError)]
        [InlineData(HttpStatusCode.BadGateway)]
        [InlineData(HttpStatusCode.ServiceUnavailable)]
        public void MapToSettingsUiError_ServerErrors_MapsToUnknownError(HttpStatusCode statusCode)
        {
            ProblemDescriptor actual = SettingsProblemMapper.MapToSettingsUiError(string.Empty, statusCode, HttpMethod.Post);

            Assert.Equal(SettingsProblem.UnknownError, actual);
        }
    }
}
