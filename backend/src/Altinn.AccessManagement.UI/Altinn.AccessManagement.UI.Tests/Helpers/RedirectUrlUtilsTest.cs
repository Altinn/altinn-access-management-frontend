using Altinn.AccessManagement.UI.Core.Helpers;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    /// <summary>
    /// Tests for <see cref="RedirectUrlUtils"/>.
    /// </summary>
    public class RedirectUrlUtilsTest
    {
        private static readonly List<string> AllowedHosts = new List<string> { "af.altinn.no" };

        [Theory]
        [InlineData("https://af.altinn.no")]
        [InlineData("https://af.altinn.no/inbox?Status=OK")]
        [InlineData("https://AF.Altinn.no/inbox")]
        [InlineData("https://af.altinn.no:443/inbox")]
        public void IsAllowedHost_ListedHttpsHost_ReturnsTrue(string redirectUrl)
        {
            Assert.True(RedirectUrlUtils.IsAllowedHost(redirectUrl, AllowedHosts));
        }

        [Theory]
        [InlineData("https://altinn.no/inbox")] // parent domain of a listed host
        [InlineData("https://data.altinn.no")] // other subdomain of the same domain
        [InlineData("https://sub.af.altinn.no/inbox")] // subdomain of a listed host
        [InlineData("https://evilaf.altinn.no/inbox")]
        [InlineData("https://af.altinn.no.evil.com/inbox")]
        [InlineData("https://af.altinn.no@evil.com/inbox")] // userinfo, host is evil.com
        [InlineData("http://af.altinn.no/inbox")] // not https
        [InlineData("af.altinn.no/inbox")] // not absolute
        [InlineData("/inbox")]
        [InlineData("")]
        [InlineData(null)]
        public void IsAllowedHost_UnlistedOrInvalidUrl_ReturnsFalse(string redirectUrl)
        {
            Assert.False(RedirectUrlUtils.IsAllowedHost(redirectUrl, AllowedHosts));
        }

        [Fact]
        public void IsAllowedHost_NoAllowedHosts_ReturnsFalse()
        {
            Assert.False(RedirectUrlUtils.IsAllowedHost("https://af.altinn.no/inbox", null));
            Assert.False(RedirectUrlUtils.IsAllowedHost("https://af.altinn.no/inbox", new List<string>()));
        }
    }
}
