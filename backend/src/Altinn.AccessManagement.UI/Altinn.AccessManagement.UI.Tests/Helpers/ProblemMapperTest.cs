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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);
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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

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
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError("", HttpStatusCode.Forbidden);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
            Assert.Equal(expectedStatusCode, actualError.StatusCode);
        }

        [Fact]
        public void MapToAuthUiError_ForwardsDelegationReasonsExtension()
        {
            // Arrange - the upstream (authentication) problem carries a delegationReasons extension member
            string responseContent = "{ \"code\": \"AUTH-00016\", \"delegationReasons\": \"Ressurs A: MissingRoleAccess\" }";

            // Act
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert - the code is mapped AND the extension member is preserved on the returned problem
            Assert.Equal("AMUI-00016", actualError.ErrorCode.ToString());
            Assert.True(actualError.Extensions.TryGetValue("delegationReasons", out string reason));
            Assert.Equal("Ressurs A: MissingRoleAccess", reason);
        }

        [Fact]
        public void MapToAuthUiError_WithoutExtensions_DoesNotAddDelegationReasons()
        {
            // Arrange - no extension members on the upstream problem
            string responseContent = "{ \"code\": \"AUTH-00016\" }";

            // Act
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert - mapped as before, and no delegationReasons is invented
            Assert.Equal("AMUI-00016", actualError.ErrorCode.ToString());
            Assert.False(actualError.Extensions.TryGetValue("delegationReasons", out _));
        }

        [Fact]
        public void MapToAuthUiError_ForwardsDelegationReasons_MultipleResourcesAndCodes()
        {
            // Arrange - a realistic grouped delegationReasons value spanning multiple resources, each with
            // one or more reason codes (as produced by authentication's DelegationHelper). The BFF must
            // forward the whole value verbatim - it must not truncate to the first resource/code.
            string reasons = "Ressurs A: MissingRoleAccess, MissingPackageAccess | Ressurs B: ResourceIsMaskinPortenSchema";
            string responseContent = "{ \"code\": \"AUTH-00016\", \"delegationReasons\": \"" + reasons + "\" }";

            // Act
            ProblemInstance actualError = ProblemMapper.MapToAuthUiError(responseContent, HttpStatusCode.BadRequest);

            // Assert - the full multi-resource / multi-code reason string is preserved unchanged
            Assert.Equal("AMUI-00016", actualError.ErrorCode.ToString());
            Assert.True(actualError.Extensions.TryGetValue("delegationReasons", out string reason));
            Assert.Equal(reasons, reason);
        }
    }
}
