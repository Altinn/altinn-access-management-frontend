using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Tests.Utils
{
    /// <summary>
    ///     Utility class for usefull common operations for setup for unittests
    /// </summary>
    public static class SetupUtils
    {
        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<MaskinportenSchemaController> customFactory)
        {
            WebApplicationFactory<MaskinportenSchemaController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddTransient<IMaskinportenSchemaClient, MaskinportenSchemaClientMock>();
                    services.AddTransient<IProfileClient, ProfileClientMock>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient();
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetSingleRightTestClient(CustomWebApplicationFactory<SingleRightController> customFactory)
        {
            WebApplicationFactory<SingleRightController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton<ISingleRightClient, SingleRightClientMock>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient();
        }

        /// <summary>
        ///     Adds an auth cookie to the request message
        /// </summary>
        /// <param name="requestMessage">the request message</param>
        /// <param name="token">the tijen to be added in the cookie</param>
        /// <param name="cookieName">the name of the cookie</param>
        /// <param name="xsrfToken">the xsrf token</param>
        public static void AddAuthCookie(HttpRequestMessage requestMessage, string token, string cookieName, string xsrfToken = null)
        {
            requestMessage.Headers.Add("Cookie", cookieName + "=" + token);
            if (xsrfToken != null)
            {
                requestMessage.Headers.Add("X-XSRF-TOKEN", xsrfToken);
            }
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for</param>
        /// <param name="allowRedirect">allow redirect flag</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<HomeController> customFactory, bool allowRedirect = false)
        {
            WebApplicationFactory<HomeController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddTransient<IAuthenticationClient, AuthenticationMock>();
                    services.AddTransient<IProfileClient, ProfileClientMock>();

                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = allowRedirect,
            };
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(opts);
        }
    }
}
