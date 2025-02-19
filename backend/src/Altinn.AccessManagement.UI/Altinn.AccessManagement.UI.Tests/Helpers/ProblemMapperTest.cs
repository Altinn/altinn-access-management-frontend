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

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError2()
        {
            // Arrange
            string errorCode = "AUTH-00002";
            string expectedErrorCode = "AMUI-00002";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }
        
        [Fact]
        public void MapToAuthUiError_ShouldReturnError3()
        {
            // Arrange
            string errorCode = "AUTH-00003";
            string expectedErrorCode = "AMUI-00003";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError4()
        {
            // Arrange
            string errorCode = "AUTH-00004";
            string expectedErrorCode = "AMUI-00004";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError11()
        {
            // Arrange
            string errorCode = "AUTH-000011";
            string expectedErrorCode = "AMUI-000011";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError14()
        {
            // Arrange
            string errorCode = "AUTH-000014";
            string expectedErrorCode = "AMUI-000014";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError16()
        {
            // Arrange
            string errorCode = "AUTH-000016";
            string expectedErrorCode = "AMUI-000016";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError18()
        {
            // Arrange
            string errorCode = "AUTH-000018";
            string expectedErrorCode = "AMUI-000018";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError19()
        {
            // Arrange
            string errorCode = "AUTH-000019";
            string expectedErrorCode = "AMUI-000019";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldReturnError20()
        {
            // Arrange
            string errorCode = "AUTH-000020";
            string expectedErrorCode = "AMUI-000020";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }

        [Fact]
        public void MapToAuthUiError_ShouldGenericError()
        {
            // Arrange
            string errorCode = "AUTH-HEHE?";
            string expectedErrorCode = "AMUI-00005";

            // Act
            ProblemDescriptor actualError = ProblemMapper.MapToAuthUiError(errorCode);

            // Assert
            Assert.Equal(expectedErrorCode, actualError.ErrorCode.ToString());
        }
    }
}
