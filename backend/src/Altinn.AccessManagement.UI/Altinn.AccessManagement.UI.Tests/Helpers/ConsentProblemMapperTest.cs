using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    [Collection("ConsentProblemMapperTests")]
    public class ConsentProblemMapperTests
    {
        [Fact]
        public void MapToConsentUiError_ShouldMapToNotAuthorizedForConsentRequest()
        {
            // Arrange
            string errorCode = "AM-00000";
            string expectedErrorCode = "CTUI-00000";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ConsentProblemMapper.MapToConsentUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToConsentUiError_ShouldGenericError()
        {
            // Arrange
            string errorCode = "AM-HEHEHE";
            string expectedErrorCode = "CTUI-00099";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ConsentProblemMapper.MapToConsentUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToConsentUiError_ShouldShowGenericProblemForErrorWithoutCode()
        {
            // Arrange
            string expectedErrorCode = "CTUI-00999";
            var expectedStatusCode = HttpStatusCode.Forbidden;

            // Act
            ProblemDescriptor actualError = ConsentProblemMapper.MapToConsentUiError("", HttpStatusCode.Forbidden);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
            Assert.Equal(expectedStatusCode, actualError.StatusCode);
        }
    }
}
