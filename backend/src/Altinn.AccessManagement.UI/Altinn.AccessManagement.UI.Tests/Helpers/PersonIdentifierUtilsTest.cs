using Altinn.AccessManagement.UI.Core.Helpers;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    /// <summary>
    /// Tests for <see cref="PersonIdentifierUtils"/>.
    /// </summary>
    public class PersonIdentifierUtilsTest
    {
        [Theory]
        [InlineData("1966-12-25", "251266*****")]
        [InlineData("1980-11-07", "071180*****")]
        [InlineData("2001-01-01", "010101*****")]
        public void MaskedIdFromDateOfBirth_ValidIsoDate_ReturnsMaskedDdMmYy(string dateOfBirth, string expected)
        {
            string actual = PersonIdentifierUtils.MaskedIdFromDateOfBirth(dateOfBirth);

            Assert.Equal(expected, actual);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData("not-a-date")]
        public void MaskedIdFromDateOfBirth_MissingOrInvalid_ReturnsEmpty(string dateOfBirth)
        {
            string actual = PersonIdentifierUtils.MaskedIdFromDateOfBirth(dateOfBirth);

            Assert.Equal(string.Empty, actual);
        }

        [Fact]
        public void MaskedIdFromDateOfBirth_NeverContainsPersonalNumberPart()
        {
            string actual = PersonIdentifierUtils.MaskedIdFromDateOfBirth("1966-12-25");

            Assert.EndsWith("*****", actual);
            Assert.Equal(11, actual.Length);
        }
    }
}
