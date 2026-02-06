using System.Net;
using System.Text;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    [Collection("ProblemMapperTests")]
    public class ProblemMapperTests
    {
        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError1()
        {
            // Arrange
            string errorCode = "AUTH-00001";
            string expectedErrorCode = "AMUI-00001";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError2()
        {
            // Arrange
            string errorCode = "AUTH-00002";
            string expectedErrorCode = "AMUI-00002";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);
            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError3()
        {
            // Arrange
            string errorCode = "AUTH-00003";
            string expectedErrorCode = "AMUI-00003";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError4()
        {
            // Arrange
            string errorCode = "AUTH-00004";
            string expectedErrorCode = "AMUI-00004";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError11()
        {
            // Arrange
            string errorCode = "AUTH-00011";
            string expectedErrorCode = "AMUI-00011";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError14()
        {
            // Arrange
            string errorCode = "AUTH-00014";
            string expectedErrorCode = "AMUI-00014";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError16()
        {
            // Arrange
            string errorCode = "AUTH-00016";
            string expectedErrorCode = "AMUI-00016";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError18()
        {
            // Arrange
            string errorCode = "AUTH-00018";
            string expectedErrorCode = "AMUI-00018";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError19()
        {
            // Arrange
            string errorCode = "AUTH-00019";
            string expectedErrorCode = "AMUI-00019";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldReturnError20()
        {
            // Arrange
            string errorCode = "AUTH-00020";
            string expectedErrorCode = "AMUI-00020";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldGenericError()
        {
            // Arrange
            string errorCode = "AUTH-HEHE";
            string expectedErrorCode = "AMUI-00005";

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{  \"code\": \"" + errorCode + "\" }", Encoding.UTF8, "application/json")
            };
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public async Task MapToAuthUiError_ShouldShowGenericProblemForErrorWithoutCode()
        {
            // Arrange
            string expectedErrorCode = "AMUI-00999";
            var expectedStatusCode = HttpStatusCode.Forbidden;

            // Act
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.Forbidden);
            ProblemDescriptor actualError = await ProblemMapper.MapToAuthUiError(response, CancellationToken.None);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
            Assert.Equal(expectedStatusCode, actualError.StatusCode);
        }
    }
}
