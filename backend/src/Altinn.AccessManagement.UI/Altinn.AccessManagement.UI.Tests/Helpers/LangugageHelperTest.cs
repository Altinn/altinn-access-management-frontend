using Altinn.AccessManagement.UI.Core.Helpers;
using Microsoft.AspNetCore.Http;
using Moq;


[Collection("LanguageHelper Tests")]
public class LanguageHelperTests
{
    [Theory]
    [InlineData("UL=1044", "no_nb")]
    [InlineData("UL=2068", "no_nn")]
    [InlineData("UL=1033", "en")]
    public void GetAltinnPersistenceCookieValueFrontendStandard_ShouldReturnExpectedValue(string cookieValue, string expectedValue)
    {
        // Arrange
        var httpContextMock = new Mock<HttpContext>();
        var requestMock = new Mock<HttpRequest>();
        var cookiesMock = new Mock<IRequestCookieCollection>();

        cookiesMock.Setup(c => c["altinnPersistentContext"]).Returns(cookieValue);
        requestMock.Setup(r => r.Cookies).Returns(cookiesMock.Object);
        httpContextMock.Setup(h => h.Request).Returns(requestMock.Object);

        // Act
        var result = LanguageHelper.GetAltinnPersistenceCookieValueFrontendStandard(httpContextMock.Object);

        // Assert
        Assert.Equal(expectedValue, result);
    }

    [Fact]
    public void GetAltinnPersistenceCookieValueFrontendStandard_ShouldReturnEmptyString_WhenCookieIsNull()
    {
        // Arrange
        var httpContextMock = new Mock<HttpContext>();
        var requestMock = new Mock<HttpRequest>();
        var cookiesMock = new Mock<IRequestCookieCollection>();

        cookiesMock.Setup(c => c["altinnPersistentContext"]).Returns((string)null);
        requestMock.Setup(r => r.Cookies).Returns(cookiesMock.Object);
        httpContextMock.Setup(h => h.Request).Returns(requestMock.Object);

        // Act
        var result = LanguageHelper.GetAltinnPersistenceCookieValueFrontendStandard(httpContextMock.Object);

        // Assert
        Assert.Equal(string.Empty, result);
    }

    [Theory]
    [InlineData("UL=1044", "nb")]
    [InlineData("UL=2068", "nn")]
    [InlineData("UL=1033", "en")]
    public void GetSelectedLanguageCookieValueBackendStandard_ShouldReturnExpectedValue(string cookieValue, string expectedValue)
    {
        // Arrange
        var httpContextMock = new Mock<HttpContext>();
        var requestMock = new Mock<HttpRequest>();
        var cookiesMock = new Mock<IRequestCookieCollection>();

        cookiesMock.Setup(c => c["selectedLanguage"]).Returns(cookieValue);
        requestMock.Setup(r => r.Cookies).Returns(cookiesMock.Object);
        httpContextMock.Setup(h => h.Request).Returns(requestMock.Object);

        // Act
        var result = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(httpContextMock.Object);

        // Assert
        Assert.Equal(expectedValue, result);
    }


    [Fact]
    public void GetSelectedLanguageCookieValueBackendStandard_ShouldReturnEmptyString_WhenCookieIsNull()
    {
        // Arrange
        var httpContextMock = new Mock<HttpContext>();
        var requestMock = new Mock<HttpRequest>();
        var cookiesMock = new Mock<IRequestCookieCollection>();

        cookiesMock.Setup(c => c["selectedLanguage"]).Returns((string)null);
        requestMock.Setup(r => r.Cookies).Returns(cookiesMock.Object);
        httpContextMock.Setup(h => h.Request).Returns(requestMock.Object);

        // Act
        var result = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(httpContextMock.Object);

        // Assert
        Assert.Equal(string.Empty, result);
    }

    [Theory]
    [InlineData("UL=1044", "nb")]
    [InlineData("UL=2068", "nn")]
    [InlineData("UL=1033", "en")]
    [InlineData("no_nb", "nb")]
    [InlineData("no_nn", "nn")]
    [InlineData("en", "en")]
    public void GetBackendStandardLanguage_ShouldReturnExpectedValue(string cookieValue, string expectedValue)
    {
        // Act
        var result = LanguageHelper.GetBackendStandardLanguage(cookieValue);

        // Assert
        Assert.Equal(expectedValue, result);
    }

    [Theory]
    [InlineData("UL=1044", "no_nb")]
    [InlineData("UL=2068", "no_nn")]
    [InlineData("UL=1033", "en")]
    [InlineData("nb", "no_nb")]
    [InlineData("nn", "no_nn")]
    [InlineData("en", "en")]
    public void GetFrontendStandardLanguage_ShouldReturnExpectedValue(string cookieValue, string expectedValue)
    {
        // Act
        var result = LanguageHelper.GetFrontendStandardLanguage(cookieValue);

        // Assert
        Assert.Equal(expectedValue, result);
    }
}