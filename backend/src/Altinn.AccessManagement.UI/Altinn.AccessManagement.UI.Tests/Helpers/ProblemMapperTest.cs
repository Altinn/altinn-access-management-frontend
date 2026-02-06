using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    [Collection("ProblemMapperTests")]
    public class ProblemMapperTests
    {
        [Fact]
        public void MapToAuthUiError_ShouldReturnError1()
        {
            // Arrange
            string errorCode = "AUTH-00001";
            string expectedErrorCode = "AMUI-00001";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError2()
        {
            // Arrange
            string errorCode = "AUTH-00002";
            string expectedErrorCode = "AMUI-00002";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);
            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError3()
        {
            // Arrange
            string errorCode = "AUTH-00003";
            string expectedErrorCode = "AMUI-00003";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError4()
        {
            // Arrange
            string errorCode = "AUTH-00004";
            string expectedErrorCode = "AMUI-00004";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError11()
        {
            // Arrange
            string errorCode = "AUTH-00011";
            string expectedErrorCode = "AMUI-00011";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError14()
        {
            // Arrange
            string errorCode = "AUTH-00014";
            string expectedErrorCode = "AMUI-00014";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError16()
        {
            // Arrange
            string errorCode = "AUTH-00016";
            string expectedErrorCode = "AMUI-00016";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError18()
        {
            // Arrange
            string errorCode = "AUTH-00018";
            string expectedErrorCode = "AMUI-00018";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError19()
        {
            // Arrange
            string errorCode = "AUTH-00019";
            string expectedErrorCode = "AMUI-00019";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError20()
        {
            // Arrange
            string errorCode = "AUTH-00020";
            string expectedErrorCode = "AMUI-00020";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldGenericError()
        {
            // Arrange
            string errorCode = "AUTH-HEHE";
            string expectedErrorCode = "AMUI-00005";
            string responseContent = "{  \"code\": \"" + errorCode + "\" }";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldShowGenericProblemForErrorWithoutCode()
        {
            // Arrange
            string expectedErrorCode = "AMUI-00999";
            var expectedStatusCode = HttpStatusCode.Forbidden;

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError("", HttpStatusCode.Forbidden);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
            Assert.Equal(expectedStatusCode, actualError.StatusCode);
        }
    }
}
