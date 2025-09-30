﻿using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Http;
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
        public static HttpClient GetTestClient(CustomWebApplicationFactory<APIDelegationController> customFactory)
        {
            WebApplicationFactory<APIDelegationController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<IProfileClient, ProfileClientMock>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                HandleCookies = true,
            };
            factory.Server.AllowSynchronousIO = true;
            var client = factory.CreateClient(opts);
            client.DefaultRequestHeaders.Add("Cookie", "altinnPersistentContext=UL=1044");
            client.DefaultRequestHeaders.Add("Cookie", "selectedLanguage=no_nb");

            return client;
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
                    services.AddSingleton<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                HandleCookies = true,
            };
            factory.Server.AllowSynchronousIO = true;
            var client = factory.CreateClient(opts);
            client.DefaultRequestHeaders.Add("Cookie", "altinnPersistentContext=UL=1044");
            client.DefaultRequestHeaders.Add("Cookie", "selectedLanguage=no_nb");

            return client;
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for UserController tests</param>
        /// <param name="flags">Override featureFlags in the client. Defaults to true if not set</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<UserController> customFactory, FeatureFlags flags)
        {
            WebApplicationFactory<UserController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<IProfileClient, ProfileClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                    services.Configure<FeatureFlags>(options =>
                    {
                        options.DisplayPopularSingleRightsServices = flags?.DisplayPopularSingleRightsServices ?? true;
                        options.DisplayResourceDelegation = flags?.DisplayResourceDelegation ?? true;
                        options.DisplayConfettiPackage = flags?.DisplayConfettiPackage ?? true;
                        options.DisplayLimitedPreviewLaunch = flags?.DisplayLimitedPreviewLaunch ?? true;
                        options.DisplayConsentGui = flags?.DisplayConsentGui ?? true;
                    });
                });
            });
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient();
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for UserController tests</param>
        /// <param name="flags">Override featureFlags in the client. Defaults to true if not set</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<RoleController> customFactory, FeatureFlags flags)
        {
            WebApplicationFactory<RoleController> factory = customFactory.WithWebHostBuilder(builder =>
           {
               builder.ConfigureTestServices(services =>
               {
                   services.AddTransient<IAccessPackageClient, AccessPackageClientMock>();
                   services.AddTransient<IProfileClient, ProfileClientMock>();
                   services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                   services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                   services.Configure<FeatureFlags>(options =>
                   {
                       options.DisplayPopularSingleRightsServices = flags?.DisplayPopularSingleRightsServices ?? true;
                       options.DisplayResourceDelegation = flags?.DisplayResourceDelegation ?? true;
                       options.DisplayConfettiPackage = flags?.DisplayConfettiPackage ?? true;
                       options.DisplayLimitedPreviewLaunch = flags?.DisplayLimitedPreviewLaunch ?? true;
                       options.DisplayConsentGui = flags?.DisplayConsentGui ?? true;
                       options.RestrictPrivUse = flags?.RestrictPrivUse ?? false;
                       options.CrossPlatformLinks = flags?.CrossPlatformLinks ?? false;
                   });
               });
           });
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient();
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for AccessPackageController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<AccessPackageController> customFactory)
        {
            WebApplicationFactory<AccessPackageController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IAccessPackageClient, AccessPackageClientMock>();
                    services.AddTransient<IProfileClient, ProfileClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient();
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for SettingController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<SettingsController> customFactory)
        {
            WebApplicationFactory<SettingsController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IProfileClient, ProfileClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient();
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for SystemRegisterController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<SystemRegisterController> customFactory)
        {
            WebApplicationFactory<SystemRegisterController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<ISystemRegisterClient, SystemRegisterClientMock>();
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddTransient<IRegisterClient, RegisterClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            factory.Server.AllowSynchronousIO = true;
            var client = factory.CreateClient();
            client.DefaultRequestHeaders.Add("Cookie", "altinnPersistentContext=UL=1044");
            client.DefaultRequestHeaders.Add("Cookie", "selectedLanguage=no_nb");
            return client;
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for SystemUserController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<SystemUserController> customFactory)
        {
            WebApplicationFactory<SystemUserController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<ISystemUserClient, SystemUserClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<ISystemRegisterClient, SystemRegisterClientMock>();
                    services.AddTransient<IRegisterClient, RegisterClientMock>();
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient();
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for SystemUserRequestController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<SystemUserRequestController> customFactory)
        {
            WebApplicationFactory<SystemUserRequestController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<ISystemUserRequestClient, SystemUserRequestClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<ISystemRegisterClient, SystemRegisterClientMock>();
                    services.AddTransient<IRegisterClient, RegisterClientMock>();
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            };
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(opts);
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for SystemUserChangeRequestController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<SystemUserChangeRequestController> customFactory)
        {
            WebApplicationFactory<SystemUserChangeRequestController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<ISystemUserChangeRequestClient, SystemUserChangeRequestClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<ISystemRegisterClient, SystemRegisterClientMock>();
                    services.AddTransient<IRegisterClient, RegisterClientMock>();
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            };
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(opts);
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for SystemUserAgentRequestController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<SystemUserAgentRequestController> customFactory)
        {
            WebApplicationFactory<SystemUserAgentRequestController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<ISystemUserAgentRequestClient, SystemUserAgentRequestClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<ISystemRegisterClient, SystemRegisterClientMock>();
                    services.AddTransient<IRegisterClient, RegisterClientMock>();
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            };
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(opts);
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for SystemUserAgentDelegationController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<SystemUserAgentDelegationController> customFactory)
        {
            WebApplicationFactory<SystemUserAgentDelegationController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<ISystemUserAgentDelegationClient, SystemUserAgentDelegationClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<ISystemRegisterClient, SystemRegisterClientMock>();
                    services.AddTransient<IRegisterClient, RegisterClientMock>();
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            };
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(opts);
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for ConsentController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<ConsentController> customFactory)
        {
            WebApplicationFactory<ConsentController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IEncryptionService, EncryptionServiceMock>();
                    services.AddTransient<IConsentClient, ConsentClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<IRegisterClient, RegisterClientMock>();
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            };
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(opts);
        }

        /// <summary>
        ///     Gets a HttpClient for unittests testing
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for ConsentController tests</param>
        /// <returns>HttpClient</returns>
        public static HttpClient GetTestClient(CustomWebApplicationFactory<LogoutRedirectController> customFactory)
        {
            WebApplicationFactory<LogoutRedirectController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IEncryptionService, EncryptionServiceMock>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            };
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(opts);
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
        ///     Adds an the altinnPersistentContext language cookie to the request (with norwegian bokmål as language)
        /// </summary>
        /// <param name="requestMessage">the request message</param>
        public static void AddLanguageCookie(HttpRequestMessage requestMessage)
        {
            requestMessage.Headers.Add("Cookie", "altinnPersistentContext=UL=1044");

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
            var client = factory.CreateClient(opts);
            client.DefaultRequestHeaders.Add("Cookie", "altinnPersistentContext=UL=1044");

            return client;
        }

        /// <summary>
        /// Gets a HttpClient for unittests testing for AltinnCdnController
        /// </summary>
        /// <param name="customFactory">Web app factory to configure test services for AltinnCdnController tests</param>
        /// <param name="value">An object to be used in the setup, can be null</param>
        /// <returns>HttpClient</returns>
        internal static HttpClient GetTestClient(CustomWebApplicationFactory<AltinnCdnController> customFactory)
        {
            WebApplicationFactory<AltinnCdnController> factory = customFactory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton<IAltinnCdnClient, AltinnCdnClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            };
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(opts);
        }
    }
}
