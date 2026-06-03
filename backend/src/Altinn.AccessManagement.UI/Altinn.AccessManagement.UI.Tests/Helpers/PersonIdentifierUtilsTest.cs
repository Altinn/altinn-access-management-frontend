using Altinn.AccessManagement.UI.Core.Helpers;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    /// <summary>
    /// Tests for <see cref="PersonIdentifierUtils"/>.
    /// </summary>
    public class PersonIdentifierUtilsTest
    {
        [Theory]
        [InlineData("1966-12-25", "25.12.1966")]
        [InlineData("1980-11-07", "07.11.1980")]
        [InlineData("2001-01-01", "01.01.2001")]
        public void FormatDateOfBirth_ValidIsoDate_ReturnsDdMmYyyy(string dateOfBirth, string expected)
        {
            string actual = PersonIdentifierUtils.FormatDateOfBirth(dateOfBirth);

            Assert.Equal(expected, actual);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData("not-a-date")]
        public void FormatDateOfBirth_MissingOrInvalid_ReturnsEmpty(string dateOfBirth)
        {
            string actual = PersonIdentifierUtils.FormatDateOfBirth(dateOfBirth);

            Assert.Equal(string.Empty, actual);
        }

        [Fact]
        public void FormatDateOfBirth_NeverContainsPersonalNumberPart()
        {
            string actual = PersonIdentifierUtils.FormatDateOfBirth("1966-12-25");

            // Only the birth date, no personal-number digits or masking.
            Assert.Equal("25.12.1966", actual);
            Assert.DoesNotContain("*", actual);
        }
    }
}
